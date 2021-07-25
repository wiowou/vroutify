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

Please refer to the example folder for a working Vue.js project that uses Vroutify.
The examples in the documentation refer directly to it.

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

```
--pages-dir [src/pages]
```

A relative path from the project root directory. It defaults to src/pages

```
--routes-dir [src/router]
```

A relative path from the project root directory. It defaults to src/router

```
--source-dir [src]
```

A relative path from the project root directory. It defaults to src

```
--source-dir-alias [@]
```

An alias for the source-dir that should be used in import statements. It defaults to '@'. This is currently in line with what [Vue CLI](https://cli.vuejs.org/) uses.

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

These are special files that you can use to supplement the route object created by Vroutify for each route. (Route object is the name used
for each of the objects in the routes array of the routes.js file.) These files are necessary in some cases. For example, pages/readers/index.vue contains
3 router views: 1 default view and 2 named views - header and footer. These must be populated using a components object specified in the route object.
(Please refer to the [Vue Router](https://router.vuejs.org/guide/essentials/named-views.html#nested-named-views) documentation on named views if the preceding sentence is unclear)

pages/readers/routing.mjs:

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

**Options are Merged**
A routing.mjs file will merge its options with those generated automatically by Vroutify. It will override any of the automatically generated options in the routes object.
This can be useful in some cases. If, for example, a props object were specified in pages/readers/routing.mjs, it would override the automatically generated props object.

**Vue Component imports**
In the example above, the path to each view component is specified. (The '@' is an alias for the project src directory). A direct import of Vue components is not possible
at the moment since routing.mjs is read by Node.js. Import statements that are capable of being understood by Node.js can work but it is not recommended that import
statements be used in routing.mjs files at the moment.

**Functions as Properties**
Functions are supported but they must not be "arrow" functions.

##### ignored routes

Routes that start with a hyphen, '-', will be ignored by Vroutify. In this example, pages/-others and pages/-help.vue are ignored.

##### ignored files

Files that don't end in .vue will be ignored.

## license

MIT
