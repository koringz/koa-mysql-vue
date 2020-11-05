<template>
<div>

    <h1 class="mt20 mb20">搜索</h1>
    <el-input v-model.trim="options.caseNo" placeholder="案件编号" clearable @change="options.keyCaseNoQuery" class="feut-el-input">
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
    </el-input>

    <h1 class="mt20 mb20">文本框</h1>
    <el-input type="textarea" rows="6" minlength="2" maxlength="500" show-word-limit @input.enter.native="handleFlag" v-model.trim="briefDescription" class="feut-el-text-limit"/>

</div>
</template>

<script>
export default {
  data() {
    return {
        briefDescription: '',
        options: {
            caseNo: '',
            keyCaseNoQuery: function () {}
        }
    }
  },
  methods: {
      handleFlag () {

      }
  }
}
</script>

<style>
.feut-el-input{
    width: 360px;
}
.feut-el-text-limit{
    width:100%
}
</style>