# Laji.fi frontend

This is the frontend for [laji.fi](https://beta.laji.fi). Api used and it's documentation can be
found at [api.laji.fi](https://apitest.laji.fi/explorer/).

This repo contains 3 main branches. Follow guidelines set in [wiki](http://wiki.helsinki.fi/display/luomusict/Laji.fi+front+kehitysohjeet) for developing.

## Development server

### Installation

Make sure to use the correct node version marked in `.nvmrc`. You can use for example volta or nvm.

Install the dependencies:

```bash
npm ci
```

### Running

```bash
npm start
```

Go with your browser to http://localhost:3000/

### API proxy configuration

By default the app proxies api requests through https://dev.laji.fi/api. You can configure the api base and the access token with `.env` file:

```
API_BASE=https://apitest.laji.fi
ACCESS_TOKEN=<Your access token>
```

## Running end-to-end tests
1. Add the following to `.env` file at the root of the repository:
```
E2E_PERSON_TOKEN=
E2E_USER=
E2E_PASS=
```
2. get the credentials to the e2e user from another developer
3. run `npm start` to start laji.fi dev server
4. run `npx playwright test` (for headless mode), `npx playwright test --ui` (for headful mode) or [use the playwright vscode plugin](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## Further help

You can contact us by sending feedback from [laji.fi](https://beta.laji.fi) 

To get more help on the `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
