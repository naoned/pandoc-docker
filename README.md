# Pandoc Docker Container for automatic PDF generation from markdown

## How it works

First of configure one or multiple `pandoc.json` files.

Example : 
```json
{
    "output": [
        {
            "name": "install.pdf",
            "files": [
                "fr/Installation/*.md"
            ],
            "ignore": [
                "**/summary.md"
            ]
        }
    ],
    "toc": true,
    "toc-depth": 2,
    "chapters": true,
    "normalize": true,
    "highlight-style": "tango",
    "variables": {
        "documentclass": "report",
        "geometry:paper": "a4paper",
        "geometry:margin": "2cm",
        "lang": "fr",
        "mainfont": "Lato"
    }
}
```

The `pandoc.json` file declares how the PDF will be generated. What md file to include and what options to set.
All options set at the **first level will endup as an argument to the pandoc command**.

Check the [Pandoc user guide](http://pandoc.org/MANUAL.html) for the different arguments available.

Basicly any key found in the json will be prefixed with `--` and passed as an argument. Therefore we don't support shorthand arguments.

You can declare multiple PDF files to generate in `output`. You can also override global arguments in `output`.

For example here we disable the table of content for the second pdf only :
```json
{
    "output": [
        {
            "name": "install.pdf",
            "files": [
                "fr/Installation/*.md"
            ]
        }
        {
            "name": "uninstall.pdf",
            "files": [
                "fr/Removal/*.md"
            ],
            "toc": false,
            "toc-depth": false
        }
    ],
    "toc": true,
    "toc-depth": 2
}
```

The files paths are interpreted from the base path of the `pandoc.json` file. You may use glob patterns as defined [here](https://github.com/isaacs/node-glob)

Run the following command in the folder you want to scan for `pandoc.json` files.
```bash
docker run --rm -v `pwd`:/source naoned/pandoc
```

The pdfs will be generated next to the `pandoc.json` file that declared them.

## Remark about markdown

We are using **Latex** to output to PDF and it's using a custom interpreter for the markdown.
There may be differences and there is more options available.

You can check them out here: [https://www.ctan.org/help/markdown](https://www.ctan.org/help/markdown)