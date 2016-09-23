# Pandoc Docker Container

[Docker](https://www.docker.io/) container for the source distribution of [Pandoc](http://johnmacfarlane.net/pandoc), with Latex tools installed.

    docker run naoned/pandoc

    pandoc [OPTIONS] [FILES]
    Input formats:  docbook, haddock, html, json, latex, markdown, markdown_github,
                    markdown_mmd, markdown_phpextra, markdown_strict, mediawiki,
                    native, opml, rst, textile
    Output formats: asciidoc, beamer, context, docbook, docx, dzslides, epub, epub3,
                    fb2, html, html5, json, latex, man, markdown, markdown_github,
                    markdown_mmd, markdown_phpextra, markdown_strict, mediawiki,
                    native, odt, opendocument, opml, org, pdf*, plain, revealjs,
                    rst, rtf, s5, slideous, slidy, texinfo, textile
                    [*for pdf output, use latex or beamer and -o FILENAME.pdf

A `/source` directory is created in the container, which can be mapped for use with relative file paths. Pandoc will always be run from the `/source` directory in the container.

    docker run -v `pwd`:/source naoned/pandoc -f markdown -t html5 myfile.md -o myfile.html

## Preconfigured PDF generation

You can run
```bash
docker run -v `pwd`:/source naoned/pandoc docs
```

And if the mounted folder in source matches the following structure, pdfs will be generated:
```
- languagecode
    - pdfname
        - mdfile.md (may be in subdir)
```

Example :
```
- en
    - First PDF name
        - firstpdfchapter.md
        - secondpdfchapter.md
            - subdir
                - anotherchapter.md
    - Second PDF name
        - chapter1.md
        - chapter2.md
- fr
    - ...
- ...
```

## Remark about markdown

We are using **Latex** to output to PDF and it's using a custom interpreter for the markdown.
There may be differences and there is more options available.

You can check them out here: [https://www.ctan.org/help/markdown](https://www.ctan.org/help/markdown)