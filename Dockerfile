# base image
FROM node:10.17.0

# install chrome for protractor tests
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -yq google-chrome-stable \
  && rm -rf /var/lib/apt/lists/*

# set working directory
WORKDIR /app

# prepare the env (npm will not run script if using root)
ENV PATH=$PATH:/app/node_modules/.bin

# install and cache app dependencies
COPY patches ./patches
COPY scripts ./scripts
COPY package* ./

RUN npm ci --unsafe-perm

# add app
COPY . .

# start app
CMD npm run start
