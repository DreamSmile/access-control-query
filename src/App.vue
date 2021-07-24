<template>
  <div id="app">
    <router-view />
  </div>
</template>
<style lang="less">
#app {
  font-family: PingFang SC, -apple-system, BlinkMacSystemFont, Tahoma, Arial,
    Hiragino Sans GB, Microsoft YaHei, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100vw;
  height: 100vh;
  max-width: 540px;
  margin: 0 auto;
  // 以下三行代码作用为解决ios的橡皮筋bug
  // position: fixed;
  // overflow-x: hidden;
  // overflow-y: auto;
}
</style>