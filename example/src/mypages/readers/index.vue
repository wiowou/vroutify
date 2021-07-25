<template>
  <h2>Readers</h2>
  <router-link to="/readers/29">User 29</router-link>
  <span> | </span>
  <router-link to="/readers/37">User 37</router-link>
  <router-view name="header" />
  <router-view />
  <router-view name="footer" />
</template>
