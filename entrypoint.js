#!/usr/bin/env node

// This script needs to run as root for pandoc to be available
process.umask(002); // Make new file group+user editable

// Dependencies
const fs            = require("fs");
const Promise       = require('promise')
const glob          = require("glob");
const pGlob         = Promise.denodeify(glob);
const pReadFile     = Promise.denodeify(fs.readFile)
const pWriteFile    = Promise.denodeify(fs.writeFile)
const util          = require('util');
const unique        = require('array-unique');
const child_process = require('child_process');
const deepAssign    = require('deep-assign')

// The job
const pFind           = pGlob('**/pandoc.json', {dot: true});
const pConfigFiles    = pFind.then((files) => readPandocConfigFiles(files));
const pPdfConfigs     = pConfigFiles.then((configs) => buildPdfConfigs(configs));
const pPandocCommands = pPdfConfigs.then((pdfConfigs) => buildPandocCommands(pdfConfigs));
pPandocCommands.then((configs) => {
    executeCommands(configs);
});

function readPandocConfigFiles(files) {
    const promise = new Promise((resolve, reject) => {
        if(!files.length) {
            reject('No config file found');
        } else {
            var configs = [];
            files.forEach(function(configFile, index) {
                pReadFile(configFile, 'utf8').then((data) => {
                    configs.push({
                        'file': configFile,
                        'data': JSON.parse(data)
                    });
                    if (files.length === index + 1) {
                        resolve(configs);
                    }
                });
            });
        }
    });

    return promise;
}

function buildPdfConfigs(pandocConfigs) {
    var pdfConfigs = [];
    pandocConfigs = pandocConfigs.filter(validateConfig);
    pandocConfigs.forEach((config) => {
        if(util.isArray(config.data.output)) {
            config.data.output.forEach((pdfOutput) => {
                let pdfConfig = deepAssign({}, config.data, pdfOutput);
                pdfConfig.root = config.file.replace(/pandoc\.json$/, '');
                delete pdfConfig.output;
                pdfConfigs.push(pdfConfig);
            });
        }
    });

    return pdfConfigs;
}

function validateConfig(config) {
    if (util.isArray(config.data)) {
        console.error('Config ' + config.file + ' root element should be an object');
        return false;
    }

    if (isEmptyObject(config.data)) {
        console.error('Config ' + config.file + ' is empty');
        return false;
    }

    if (!util.isArray(config.data.output)) {
        console.error('Config ' + config.file + ' does not have a valid output field (array)');
        return false;
    }

    if (util.isArray(config.data.output)) {
        config.data.output.forEach((pdfOutput) => {
            if (!util.isString(pdfOutput.name) || pdfOutput.name.trim() === '') {
                console.error('Config ' + config.file + ' is missing an output name for one of its output');
                return false;
            }

            if (!util.isArray(pdfOutput.files) || pdfOutput.files === 0) {
                console.error('Config ' + config.file + ' missing files for one of its output');
                return false;
            }
        });
    }

    console.log('Config ' + config.file + ' is OK');
    return true;
}

function isEmptyObject(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

function buildPandocCommands(pdfConfigs) {
    let configs = [];

    pdfConfigs.forEach((config) => {
        configs.push(buildPandocCommand(config));
    });

    return Promise.all(configs);
}

function buildPandocCommand(config) {
    const promise = new Promise((resolve, reject) => {
        let command = [
            '--filter',
            '/__rewritelinks.hs',
            '--from',
            'markdown_github+yaml_metadata_block',
            '--to',
            'latex',
            '--latex-engine',
            'xelatex',
            '--output',
            config.root + config.name
        ];
        const ignoredParams = ['root', 'variables', 'name', 'files', 'ignore', 'from', 'to', 'latex-engine'];
        for (var key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key) && ignoredParams.indexOf(key) < 0) {
                if(!util.isBoolean(config[key])) {
                    command.push('--' + key);
                    command.push(config[key]);
                } else if(config[key]) {
                    command.push('--' + key);
                }
            }
        }
        if (typeof config.variables === 'object') {
            for (var key in config.variables) {
                if (Object.prototype.hasOwnProperty.call(config.variables, key)) {
                    command.push('--variable');
                    command.push(key + '=' + config.variables[key]);
                }
            }
        }
        Promise.all([buildFileList(config.root, config.files), buildFileList(config.root, config.ignore)]).then((res) => {
            let files    = res[0];
            const ignore = res[1];
            ignore.forEach((item) => {
                const index = files.indexOf(item);
                if(index >= 0) {
                    files.splice(index, 1);
                }
            });
            console.log('---------');
            console.log(config.root + config.name + ' will contain:');
            console.log(files.join('\n'));
            if(ignore.length) {
                console.log('Ignored:');
                console.log(ignore.join('\n'));
            }
            console.log('---------');
            concatFiles(files, config.name).then((concatFile) => {
                command.push(concatFile);
                config.command = command;
                resolve(config);
            });
        });
    });

    return promise;
}

function buildFileList(pdfRoot, findList) {
    var promise = new Promise((resolve, reject) => {
        let files = [];
        if(typeof findList === 'undefined' || findList.length === 0) {
            resolve(files);
        } else {
            findList.forEach((file, index) => {
                pGlob('./' + pdfRoot + file, {dot: true}).then((found) => {
                    files = files.concat(found);
                    if(findList.length === index + 1) {
                        resolve(unique(files));
                    }
                });
            });
        }
    });

    return promise;
}

function concatFiles(fileList, pdfName) {
    var output = '';
    var promise = new Promise((resolve, reject) => {
        fileList.forEach((filePath, i) => {
            pReadFile(filePath, 'utf8').then((content) => {
                output += removeIgnoreLignes(fixImagesPath(content, filePath));
                if(fileList.length === i + 1) {
                    pWriteFile('/tmp/' + pdfName + '.md', output).then(() => {
                        resolve('/tmp/' + pdfName + '.md');
                    });
                }
            });
        });
    });

    return promise;
}

function fixImagesPath(content, filePath) {
    const root = filePath.replace(/[^\/]+\.[^.]*$/, '');

    return content.replace(/(!\[.*?\])\(((?!http:\/\/)(?!https:\/\/)(?!\/).*?)\)/g, `$1(${root}$2)`);
}

function removeIgnoreLignes(content) {
    return content.replace(/<!-- pandoc-ignore-start -->[\S\s]*?<!-- pandoc-ignore-end -->/g, '');
}

function executeCommands(configs) {
    configs.forEach((config) => {
        console.log('Building ' + config.root + config.name + '...');
        child_process.execFile('/root/.cabal/bin/pandoc', config.command, function(err, out, code) {
            if(err) {
                console.log(err);
                console.log(out);
            } else {
 		console.log(out);
	    }
        });
    });
}
