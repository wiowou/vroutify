# vroutify

A Node.js module with available npx command to create the routes array required by vue-router.
Requires a 'pages' directory which contains vue component files as an input.
The 'pages' directory works in an almost identical manner to that of [Nuxt.js](https://nuxtjs.org)

# install

With [npm](http://npmjs.org) do:

```
npm install vroutify
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

# license

MIT
