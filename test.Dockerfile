FROM mcr.microsoft.com/playwright:v1.40.1

WORKDIR /app

# Copy application files (see .dockerignore for what's excluded)
COPY . .

# The volta setup is taken from https://dev.to/michalbryxi/volta-in-docker-162a

# bash will load volta() function via .bashrc
# using $VOLTA_HOME/load.sh
SHELL ["/bin/bash", "-c"]

# since we're starting non-interactive shell,
# we wil need to tell bash to load .bashrc manually
ENV BASH_ENV ~/.bashrc
# needed by volta() function
ENV VOLTA_HOME /root/.volta
# make sure packages managed by volta will be in PATH
ENV PATH $VOLTA_HOME/bin:$PATH
# install volta
RUN curl https://get.volta.sh | bash
RUN volta install node

RUN npm ci

ENV PLAYWRIGHT_JUNIT_OUTPUT_NAME test-results.xml

ENTRYPOINT ["npx", "playwright", "test"]
