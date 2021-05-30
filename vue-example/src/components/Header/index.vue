<template>
    <div class="header">
        <span class="header-logo"><i class="el-icon-s-grid" style="color:#9fd225; font-size: 20px; vertical-align: middle"></i> Web UI 库</span>
        <div class="header-operation" @click="loginout">退出</div>
    </div>
</template>

<script>
export default {
    methods: {
        loginout() {
            this.$api.api_logout()
            .then(res => {
                if(res.data.code) {
                    // sessionStorage.token = null
                    this.$message.success(res.data.message)
                    this.$router.push({name: 'login' })
                }
                else{
                    this.$message.error(res.data.message)
                }
            })
        }
    }
}
</script>

<style>
.header{
    display: flex;
    justify-content: space-between;
    position: absolute;
    top: 0;
    width: 100%;
    height: 48px;
    line-height: 48px;
    text-align: left;
    align-items: center;
    background: #1e2f4e ;
    overflow: hidden;
    border-bottom: 1px solid #363f77;
}
.header-logo{
    position: relative;
    font-size: 16px;
    font-weight: bolder;
    margin-left: 38px;
    color: #fff;
}
.header-operation{
    margin-right: 50px;
    font-size: 12px;
}
</style>