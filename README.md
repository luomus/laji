# Laji.fi frontend

This is the frontend for [laji.fi](https://beta.laji.fi). Api used and it's documentation can be
found at [api.laji.fi](https://apitest.laji.fi/explorer/).

This repo contains 3 main branches. Follow guidelines set in [wiki](http://wiki.helsinki.fi/display/luomusict/Laji.fi+front+kehitysohjeet) for developing.

## Development server
```bash

# clone branch
git clone git@github.com:luomus/laji.git
cd laji

# Install application dependencies
# Redis and make sure that it's running
# Python and maker sure that the python executable is in the path

# Install js dependencies (node >= v14)
npm ci

# Run the environment
npm start

# Go with your browser to http://localhost:3000/
```

## Running end-to-end tests
1. Create an empty `.env` file at the root of the repository:
```
PERSON_TOKEN=
E2E_USER=
E2E_PASS=
```
2. get the credentials to the e2e user from a colleague
3. run `npm start` to start laji.fi dev server
4. run `npx playwright test` (for headless mode), `npx playwright test --ui` (for headful mode) or [use the playwright vscode plugin](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## Further help

You can contact us by sending feedback from [laji.fi](https://beta.laji.fi) 

To get more help on the `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
