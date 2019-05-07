# Laji.fi frontend

This is the frontend for [laji.fi](https://beta.laji.fi). Api used and it's documentation can be
found at [api.laji.fi](https://apitest.laji.fi/explorer/).

This repo contains 3 main branches. Follow guidelines set in [wiki](http://wiki.helsinki.fi/display/luomusict/Laji.fi+front+kehitysohjeet) for developing.

## Development server
```bash
# Install yarn globally
npm install yarn -g

# clone branch
git clone https://bitbucket.org/luomus/laji.fi-front.git
cd laji.fi-front

# change to dev
git checkout -b development

# Install application dependencies
# Redis and make sure that it's running
# Python and maker sure that the python executable is in the path

# Install js dependencies
yarn install --frozen-lockfile --check-files

# Run the environment
yarn run start

# Go with your browser to http://localhost:3000/
```

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

You can contact us by sending feedback from [laji.fi](https://beta.laji.fi) 

To get more help on the `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
