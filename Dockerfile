FROM haskell:7.10

# will ease up the update process
# updating this env variable will trigger the automatic build of the Docker image
ENV PANDOC_VERSION "1.17.2"

# install pandoc
RUN cabal update && cabal install pandoc-${PANDOC_VERSION}

# install latex packages
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-xetex \
    latex-xcolor \
    texlive-math-extra \
    texlive-latex-extra \
    texlive-lang-all \
    lmodern \
	fonts-lato \
    fontconfig

COPY ./entrypoint.sh /
COPY ./__rewritelinks.hs /

WORKDIR /source

ENTRYPOINT ["/entrypoint.sh"]
