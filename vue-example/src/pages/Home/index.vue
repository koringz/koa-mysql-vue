<template>
  <div style="height: 100%; padding-top: 1px;;">
      <Header/>
      <div class="container">
        <Navmenu />
        <div class="feut">
            <router-view />
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

<style scoped>
.feut{
  position: relative;
  margin-left: 238px;
  height: 100%;
  overflow: scroll;
}
.feut > div{
  /* min-height: calc(100% - 30px); */
  /* margin: 30px 0 0 30px; */
  padding: 30px 20px;
  /* background: #1e2f4e; */
}
</style>>
