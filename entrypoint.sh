#!/bin/bash

# /bin/bash -l -c "$*"

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
                    find "$pdf" -name "*.md" -type f -print0 | xargs -0 /root/.cabal/bin/pandoc \
                        --filter "/__rewritelinks.hs" \
                        --from=markdown_github \
                        --to=latex \
                        --toc \
                        --toc-depth=2 \
                        --chapters \
                        --latex-engine xelatex \
                        --variable lang=${LANG} \
                        --variable mainfont="Lato" \
                        --variable geometry:a4paper,margin=2cm \
                        --highlight-style tango \
                        --output="${LANG}/${PDFNAME}"
                fi
            done
        fi
    done
else
    /root/.cabal/bin/pandoc "$@"
fi

