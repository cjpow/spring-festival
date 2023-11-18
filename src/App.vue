<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App'
}
</script>

<style lang="scss">
@import "~@/assets/styles/reset.scss";
@font-face {
  font-family: '方正硬笔楷书';
  src: url('~@/assets/方正硬笔楷书.ttf');
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100%;
}
*{
  margin: 0;
  padding: 0;
}
</style>
