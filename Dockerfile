# base image
FROM node:10.16.3

# install chrome for protractor tests
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -yq google-chrome-stable

# set working directory
WORKDIR /app

# switch to non root user and prepare the env (npm will not run script if using root)
ENV PATH=$PATH:/app/node_modules/.bin

# install system globals
RUN npm install -g yarn

# install and cache app dependencies
COPY package.json .
COPY yarn.lock .
COPY patches ./patches
COPY scripts ./scripts

RUN yarn install --frozen-lockfile --network-concurrency 1 --check-files

# add app
COPY . .

# start app
CMD yarn run start
