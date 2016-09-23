#!/bin/bash

# /bin/bash -l -c "$@"

if [ "$1" = 'docs' ]; then
    for dir in ./*
    do
        if [ -d "${dir}" ]; then
            LANG=${dir%*/}
            LANG=${LANG##*/}
            for pdf in ./${LANG}/*
            do
                if [ -d "${pdf}" ]; then
                    PDFNAME=${pdf%*/}
                    PDFNAME=${PDFNAME##*/}.pdf
                    echo "Creating ${LANG}/${PDFNAME}..."
                    if [ $(find "$pdf" -name "*.md" | wc -l) -gt 0 ]; then
                        export PDF_PATH="$pdf"
                        find "$pdf" -name "*.md" -type f -print0 | xargs -0 /root/.cabal/bin/pandoc \
                            --filter "/__rewriteimagesurl.js" \
                            --filter "/__rewritelinks.hs" \
                            --from=markdown_github \
                            --to=latex \
                            --toc \
                            --toc-depth=2 \
                            --chapters \
                            --normalize \
                            --latex-engine xelatex \
                            --variable lang=${LANG} \
                            --variable mainfont="Lato" \
                            --variable geometry:a4paper,margin=2cm \
                            --variable documentclass=report \
                            --highlight-style tango \
                            --output="${LANG}/${PDFNAME}"
                    fi
                    export PDF_PATH=
                fi
            done
        fi
    done
else
    /root/.cabal/bin/pandoc "$@"
fi

