# base image
FROM node:14

# set working directory & user
USER node
WORKDIR /app

# prepare the env (npm will not run script if using root)
ENV PATH=$PATH:/app/node_modules/.bin

# install and cache app dependencies
COPY --chown=node:node patches ./patches
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node package* ./

RUN npm ci \
 && npm cache clean --force

# add app
COPY --chown=node:node . .

# start app
CMD npm run start
