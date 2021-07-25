<template>
  <h1>The home page</h1>
  <router-link to="/authors">Authors</router-link>
  <span> | </span>
  <router-link to="/editors">Editors</router-link>
  <span> | </span>
  <router-link to="/readers">Readers</router-link>
  <router-view />
</template>
