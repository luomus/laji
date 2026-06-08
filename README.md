# Laji.fi frontend

This is the frontend for [laji.fi](https://laji.fi). The API and it's documentation can be
found at [api.laji.fi](https://api.laji.fi/).

Follow guidelines set in [wiki](http://wiki.helsinki.fi/display/luomusict/Laji.fi+front+kehitysohjeet) for developing.

## Development server

## Stack

* Node.js
* Angular

### Installation

Make sure to use the correct node version marked in `.nvmrc`. You can use for example volta or nvm.

Install the dependencies:

```bash
npm ci
```

### API proxy configuration

You must configure the API base and an access token with `.env` file:

```
API_BASE=https://apitest.laji.fi
ACCESS_TOKEN=<Your access token>
```

For login redirection to work, the access token must have systemID `KE.542` assigned. If you are not an inhouse developer, ask us to assign the systemID to your token by providing the email you requested the token with to helpdesk@laji.fi.

### Running

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
2. get the credentials to the e2e user from another developer (assuming you are an inhouse developer)
3. run `npm start` to start laji.fi dev server
4. run `npx playwright test` (for headless mode), `npx playwright test --ui` (for headful mode) or [use the playwright vscode plugin](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## Further help

You can contact us by sending feedback from [laji.fi](https://laji.fi) 
