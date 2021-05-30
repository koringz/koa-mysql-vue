<template>
  <div id="app">
      <transition name="fade" class="transitionName"  mode="out-in">
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
  background-color: #1e2b46 ;
}
#app>div{
  padding:0 !important
}
.container{
  position: relative;
  top: 48px;
  height: calc(100% - 48px);
}

</style>
