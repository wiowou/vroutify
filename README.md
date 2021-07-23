# vroutify

A [Node.js](https://nodejs.org) module with available [npx](https://www.npmjs.com/package.npx) command to create the routes array required by vue-router.
Requires a 'pages' directory which contains vue component files as an input.

## install

With [npm](http://npmjs.org) install locally:

```
npm install --save-dev vroutify
```

or globally install with:

```
npm install -g vroutify
```

## vroutify-example

Please refer to [vroutify-example](https://github.com/wiowou/vroutify-example) for a working Vue.js project that uses Vroutify.

## usage

package.json

If you installed locally:

```json
"scripts": {
    "vroutify": "npx vroutify"
  },
```

If you installed globally:

```json
"scripts": {
    "vroutify": "vroutify"
  },
```

project directory structure:

```
MyProjectDirectory
|    package.json
|
|----src
|    |
|    |----pages (An example. This structure determines your application routing)
|    |    |    index.vue
|    |    |    about.vue
|    |    |
|    |    |----route1
|    |    |        index.vue
|    |    ...
|    |----router
|    |    |    index.js
|    |    |    routes.js (generated by vroutify)
```

In the terminal, issue:

```
npm run vroutify
```

## pages directory

## license

MIT
