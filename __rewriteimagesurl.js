#!/usr/bin/env node

var pandoc = require('pandoc-filter');
var Image = pandoc.Image;

function action(type, value, format, meta) {
    // For type image that is using relative path
    // - No http
    // - No starting /
    if (type === 'Image' && !/^http/.test(value[2][0]) && !/^\//.test(value[2][0])) {
        // Force the relative path of images to be start from the folder where the md file resides.
        // Otherwise pandoc tries to resolves the relative path from /source
        // value[2][0] is the path of the image from the document. Don't ask how I know...
        value[2][0] = process.env.PDF_PATH + '/' + value[2][0];
    }
}

pandoc.stdio(action);
