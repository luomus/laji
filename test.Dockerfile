FROM mcr.microsoft.com/playwright:v1.40.1

WORKDIR /app

# Copy application files (see .dockerignore for what's excluded)
COPY . .

RUN mkdir /usr/local/nvm
ENV NVM_DIR /usr/local/nvm

# nvm pulls correct node version with 'nvm use' from .nvmrc
RUN curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm use \
    && node --version \
    && npm ci

ENTRYPOINT ["npx", "playwright", "test"]
