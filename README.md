# vroutify

A [Node.js](https://nodejs.org) module with available [npx](https://www.npmjs.com/package.npx) command to create the routes array required by vue-router.
Requires version 16.5.0 of [Node.js](https://nodejs.org) or greater, [Vue.js](https://v3.vuejs.org/), and [Vue Router](https://router.vuejs.org/).

If you have used [Nuxt.js](https://nuxtjs.org/), you should find the rules about the 'pages' directory very familiar.

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

## documentation

### command line arguments

### file system routing

#### pages directory

This directory should contain your application views and the directory's structure will determine how your routes are set up.
Specifically, Vroutify will read all the .vue files and any routing.mjs files in src/pages to create a routes.js file in the
src/router folder that is used directly by [Vue Router](https://router.vuejs.org/).

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

export default [
  {
    path: '/',
    component: HOME,
    children: [
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

##### files named index.vue

These files contain Vue components that will be referenced at the route corresponding to the directory that contains the file.
For example, 'pages/index.vue' will place the component in that file at the route '/'. Likewise, 'pages/authors/index.vue' will
place the component in that file at '/authors'.

##### other .vue files

These Vue component files will place the component at a route specified by the filename. For example, 'pages/about.vue' will
place the component in that file at '/about'.

##### dynamic routes

It's often necessary to allow for routes that are accessed dynamically. For example, one may wish to access the page for a specific
author, referenced by the author's userid: '/authors/23' where 23 is a user's id. This result can be achieved by using an
underscore character to precede the directory name (as in 'pages/authors/\_userid/index.vue') or the file name (as in 'pages/editors/\_userid.vue').

##### routing.mjs files

##### ignored routes

##### ignored files

## license

MIT
