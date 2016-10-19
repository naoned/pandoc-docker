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

# install node 6
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
    curl

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash - \
    && apt-get install -y nodejs \
    && mkdir -p /var/www/.npm \
    && chown -R www-data:www-data /var/www/.npm

RUN npm install -g glob promise array-unique deep-assign

RUN apt-get update && apt-get install -y fonts-fantasque-sans \
    fonts-inconsolata \
    fonts-cantarell

COPY ./entrypoint.js /
COPY ./__rewritelinks.hs /

ENV NODE_PATH "/usr/lib/node_modules"

WORKDIR /source

ENTRYPOINT ["/entrypoint.js"]
