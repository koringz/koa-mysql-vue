<template>
    <div class="feut-login">
        <el-form
            status-icon
            :rules="rules"
            ref="ruleForm"
            :model="ruleForm"
            class="feut-ruleForm">
            <h2 class="feut-ruleForm-title"> koa-vue-mysql </h2>
            <el-form-item label="" prop="name">
                <el-input type="text" v-model.trim="ruleForm.name" autocomplete="off" placeholder='用戶名'/>
            </el-form-item>
            <el-form-item label="" prop="pass">
                <el-input @keyup.enter.native='submitForm("ruleForm")' v-model.trim="ruleForm.pass" type="password" placeholder='密码' />
            </el-form-item>
            <el-form-item class='feut-ruleForm-submit'>
                <el-button :loading="loadingme" type="primary" class="feut-submit" @click="submitForm('ruleForm')">登录</el-button>
            </el-form-item>
            <div class='go-domain tc'></div>
        </el-form>
    </div>
</template>
<script>

    export default {
        name: 'home',
        data() {
            var validatorUser = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入用户名'))
                }
                else {
                    callback();
                }
            };
            var validatePass = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入密码'));
                }
                else {
                    callback();
                }
            };
            return {
                ruleForm: {
                    name: '',
                    pass: '',
                },
                rules: {
                    name: [
                        { validator: validatorUser, message: '请输入用户名', trigger: 'blur' },
                    ],
                    pass: [
                        { validator: validatePass, trigger: 'blur' },
                        { min: 6, message: '长度在 6 个字符以上', trigger: 'blur' }
                    ],
                },
                loadingme: false
            };
        },
        created() {
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.login()
                    }
                    else {
                        return window.console.log('登录失败!');
                    }
                });
            },
            login() {
                let username = this.ruleForm.name
                let password = this.ruleForm.pass
                // 本地登录
                this.$api.api_login(this.ruleForm)
                .then(res => {
                    if(res.data.code) {
                        sessionStorage.token = res.data.data.token
                        this.$message.success(res.data.message)
                        this.$router.push({ name:  'grid' })
                    }
                    else this.$message.info(res.data.data)
                })
            },
        }
    }
</script>
<style scoped>
.feut-login{
    position: fixed;
    margin: 0 auto;
    width: 100%;
    height: 100%;
}
.feut-ruleForm {
    width: 300px;
    padding: 0 20px;
    margin: 180px auto 0;
    /* color: #333;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, .4);
    background-color: #447963; */
    border-radius: 6px;
}
.feut-ruleForm-title {
    margin: 0;
    height: 0;
    height: 50px;
    line-height: 50px;
    padding: 0;
    font-size: 24px;
    font-weight: 600;
    color: #96bdf9;
    text-align: left;
    border-bottom: 1px solid #4c5a9a
}
.feut-ruleForm-submit{
    margin-bottom: 18px !important;
}
.go-domain{
    padding-bottom: 10px;
    text-align: left;
    font-size: 12px;
    color: #3a4997;
}
.go-domain .domain-link{
    cursor: pointer;
    color: #409eff;
    text-decoration: none;
}
.go-domain a{
    cursor: pointer;
}
</style>