# vroutify

A [Node.js](https://nodejs.org) module with available [npx](https://www.npmjs.com/package.npx) command to create the routes array required by vue-router.
Requires a 'pages' directory which contains vue component files as an input.

# TODO

- Test each feature thoroughly using Mocha and Chai

# install

With [npm](http://npmjs.org) do:

```
npm install --save-dev vroutify
```

# usage

package.json

```json
"scripts": {
    "vroutify": "npx vroutify"
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

# pages directory

# license

MIT
