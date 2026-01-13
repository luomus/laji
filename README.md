# Laji.fi frontend

This is the frontend for [laji.fi](https://beta.laji.fi). Api used and it's documentation can be
found at [api.laji.fi](https://apitest.laji.fi/explorer/).

This repo contains 3 main branches. Follow guidelines set in [wiki](http://wiki.helsinki.fi/display/luomusict/Laji.fi+front+kehitysohjeet) for developing.

## Development server

## Installation

Make sure to use the correct node version marked in `.nvmrc`. You can use for example volta or nvm.

Install dependencies
```bash
npm ci
```

Fill in the development access token to `.env` like so:

```
ACCESS_TOKEN=<YOUR ACCESS TOKEN>
```

The access token needs to be connected to laji.fi's "system id". Ask one from your colleagues.

## Running
```bash
npm start
```

Go with your browser to http://localhost:3000/

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
