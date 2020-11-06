<template>
  <div id="app">
      <transition>
        <keep-alive>
            <router-view />
        </keep-alive>
      </transition>
  </div>
</template>

<script>
export default {
  components: {
  }
}
</script>

<style>
html,
body,
#app {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  background-color: #141f2f;
}
.container{
  position: relative;
  margin-top: 48px;
  height: calc(100% - 48px);
}

</style>
