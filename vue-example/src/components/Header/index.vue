<template>
    <div class="header">
        <span class="header-logo">ui库</span>
        <div class="header-operation" @click="loginout">退出</div>
    </div>
</template>

<script>
export default {
    methods: {
        loginout() {
            this.$api.api_logout()
            .then(res => {
                debugger
                if(res.data.code) {
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
    text-align: left;
    align-items: center;
    background: #2a7b94;
    border-bottom: 1px solid #363f77;
}
.header-logo{
    font-size: 22px;
    font-weight: 600;
    margin-left: 38px;
    color: #fff;
}
.header-operation{
    margin-right: 50px;
}
</style>