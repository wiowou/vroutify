# Vroutify

<p align="center">
  <a href="https://github.com/wiowou/vroutify/actions?query=branch%3Amain+event%3Apush"><img src="https://github.com/wiowou/vroutify/actions/workflows/test.yml/badge.svg?branch=main&event=push" alt="Tests Status"></a>
  <a href="https://codecov.io/gh/wiowou/vroutify"><img src="https://badgen.net/codecov/c/github/wiowou/vroutify/main" alt="Coverage Status"></a>
  <a href="https://codecov.io/gh/wiowou/vroutify">
    <img src="https://codecov.io/gh/wiowou/vroutify/branch/main/graph/badge.svg?token=RH4WYSTMBX" alt="Coverage Status"/>
  </a>
  <a href="https://www.npmjs.com/package/vroutify"><img src="https://badgen.net/npm/dm/vroutify" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/vroutify"><img src="https://badgen.net/npm/v/vroutify" alt="Version"></a>
  <a href="https://www.npmjs.com/package/vroutify"><img src="https://badgen.net/npm/license/vroutify" alt="License"></a>
</p>

A [Node.js](https://nodejs.org) module with available [npx](https://www.npmjs.com/package.npx) command to create the routes array required by vue-router.
Requires version 16.5.0 of [Node.js](https://nodejs.org) or greater, [Vue.js](https://v3.vuejs.org/), and [Vue Router](https://router.vuejs.org/).

If you have used [Nuxt.js](https://nuxtjs.org/), you should find the rules about the `pages` directory very familiar.

## Install

With [npm](http://npmjs.org) install locally:

```
npm install --save-dev vroutify
```

or install globally:

```
npm install -g vroutify
```

## Vroutify Example

Please refer to the example folder for a working Vue.js project that uses Vroutify.
The examples in the documentation refer directly to it.

## Usage

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
MyProject
...
├── src
│   ├── App.vue
│   ├── components
│   │   ├── AFooter.vue
│   │   └── AHeader.vue
│   ├── main.js
│   ├── pages
│   │   ├── about.vue
│   │   ├── authors
...
│   └── router
│       ├── index.js
│       └── routes.js
```

In the terminal, issue:

```
npm run vroutify
```

## Documentation

### Command Line Arguments

```
--pages-dir [src/pages]
```

The directory containing your application's views/pages. A relative path from the project root directory to. It defaults to `src/pages`

```
--router-dir [src/router]
```

The directory containing your router setup files. A relative path from the project root directory. It defaults to `src/router`

```
--source-dir [src]
```

The directory containing your application's source files. A relative path from the project root directory. It defaults to `src`

```
--source-dir-alias [@]
```

An alias for the source-dir that should be used in import statements. It defaults to `@`. This is currently in line with what [Vue CLI](https://cli.vuejs.org/) uses.

### File System Routing

#### Pages Directory

This directory should contain your application views and the directory's structure will determine how your routes are set up.
Specifically, Vroutify will read all the `.vue` files and any `routing.mjs` files in `src/pages` to create a `routes.js` file in the
`src/router` folder that is used directly by [Vue Router](https://router.vuejs.org/).

This file tree in the pages directory:

```
├── about.vue
├── authors/
│   ├── index.vue
│   └── _userid
│       └── index.vue
├── editors/
│   ├── ignored.js
│   ├── index.vue
│   └── _userid.vue
├── -help.vue
├── ignored.js
├── index.vue
├── -others/
│   ├── index.vue
│   └── _userid.vue
├── readers/
│   ├── index.vue
│   └── _userid/
│       ├── index.vue
│       └── routing.mjs
└── routing.mjs
```

will generate the following routes.js file:

```js
import HOME from '@/pages/index.vue';
import HOMEABOUT from '@/pages/about.vue';
import HOMEAUTHORS from '@/pages/authors/index.vue';
import HOMEAUTHORS_USERID from '@/pages/authors/_userid/index.vue';
import HOMEEDITORS from '@/pages/editors/index.vue';
import HOMEEDITORS_USERID from '@/pages/editors/_userid.vue';
import HOMEREADERS from '@/mypages/readers/index.vue';
import HOMEREADERS_USERID from '@/mypages/readers/_userid/index.vue';
import HOMEREADERS_USERIDAFOOTER from '@/components/AFooter.vue';
import HOMEREADERS_USERIDAHEADER from '@/components/AHeader.vue';

export default [
  {
    path: '/',
    component: HOME,
    children: [
      {
        path: 'readers',
        component: HOMEREADERS,
        children: [
          {
            path: ':userid',
            meta: {
              needsAuth: true,
            },
            components: {
              header: HOMEREADERS_USERIDAHEADER,
              footer: HOMEREADERS_USERIDAFOOTER,
              default: HOMEREADERS_USERID,
            },
            props: {
              header: true,
              footer: true,
              default: true,
            },
          },
        ],
      },
      {
        path: 'editors',
        component: HOMEEDITORS,
        children: [
          {
            path: ':userid',
            component: HOMEEDITORS_USERID,
            props: true,
          },
        ],
      },
      {
        path: 'authors',
        component: HOMEAUTHORS,
        children: [
          {
            path: ':userid',
            component: HOMEAUTHORS_USERID,
            props: true,
          },
        ],
      },
      {
        path: '/about',
        component: HOMEABOUT,
      },
    ],
  },
];
```

##### Files Named index.vue

These files contain Vue components that will be referenced at the route corresponding to the directory that contains the file.
For example, `pages/index.vue` will place the component in that file at the route `/`. Likewise, `pages/authors/index.vue` will
place the component in that file at `/authors`.

##### Other .vue Files

These Vue component files will place the component at a route specified by the filename. For example, `pages/about.vue` will
place the component in that file at `/about`.

##### Dynamic Routes

It's often necessary to allow for routes that are accessed dynamically. For example, one may wish to access the page for a specific
author, referenced by the author's userid: `/authors/23` where 23 is a user's id. This result can be achieved by using an
underscore character to precede the directory name (as in `pages/authors/_userid/index.vue`) or the file name (as in `pages/editors/_userid.vue`).

##### routing.mjs Files

These are special files that you can use to supplement the route object created by Vroutify for each route. (Route object is the name used
for each of the objects in the routes array of the routes.js file.) These files are necessary in some cases. For example, `pages/readers/index.vue` contains
3 router views: 1 default view and 2 named views - header and footer. These must be populated using a components object specified in the route object.
(Please refer to the [Vue Router](https://router.vuejs.org/guide/essentials/named-views.html#nested-named-views) documentation on named views if the preceding sentence is unclear)

`pages/readers/routing.mjs`:

```js
export default {
  meta: {
    needsAuth: true,
  },
  components: {
    header: '@/components/AHeader.vue',
    footer: '@/components/AFooter.vue',
    default: '@/mypages/readers/_userid/index.vue',
  },
};
```

**Options Are Merged**

A `routing.mjs` file will merge its options with those generated automatically by Vroutify. It will override any of the automatically generated options in the routes object.
This can be useful in some cases. If, for example, a props object were specified in `pages/readers/routing.mjs`, it would override the automatically generated props object.

**Vue Component Imports**

In the example above, the path to each view component is specified. (The `@` is an alias for the project src directory). A direct import of Vue components is not possible
at the moment since routing.mjs is read by Node.js. Import statements that are capable of being understood by Node.js can work but it is not recommended that import
statements be used in `routing.mjs` files at the moment.

**Functions as Properties**

Functions are supported but they must not be "arrow" functions.

##### Ignored Routes

Routes that start with a hyphen, '-', will be ignored by Vroutify. In this example, `pages/-others` and `pages/-help.vue` are ignored.

##### Ignored Files

Files that don't end in .vue will be ignored.

## License

MIT
