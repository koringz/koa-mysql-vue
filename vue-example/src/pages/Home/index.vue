<template>
  <div style="height: 100%; padding-top: 1px;;">
    <Header/>
    <div class="container">
      <Navmenu />
      <div class="feut">
        <keep-alive>
          <router-view />
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import Header from 'components/Header'
import Navmenu from 'components/Navmenu'
export default {
  components: {
    Header,
    Navmenu
  }
}
</script>

<style>
</style>
