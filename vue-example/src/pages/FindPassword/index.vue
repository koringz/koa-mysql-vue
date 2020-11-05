<template>
    <el-form :model='setFormData' :rules="rules" ref="ruleForm" label-width="124px" >
        <el-form-item label="用户名" prop="username">
            <el-input  v-model.trim="setFormData.username"  placeholder="用户名"  ></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="tel">
            <el-input v-model="setFormData.tel" placeholder="手机号码"></el-input>
        </el-form-item>
        <el-form-item label="手机验证码" prop="smscode">
            <el-input v-model="setFormData.smscode" placeholder="手机验证码" :style="{width:'270px'}"></el-input>
            <el-button type='primary' :style="{width:'110px',marginLeft:'5px',height: '40px'}" :disabled="sendStatus" @click="validateTelRepeat">{{timeValue}}</el-button>
        </el-form-item>

        <el-form-item label="设置新密码" prop="newpassword">
            <el-input v-model.trim="setFormData.newpassword" placeholder="设置新密码" ></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="password2">
            <el-input v-model="setFormData.password2" placeholder="确认新密码"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="handleSubmit">提交</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
export default {
    data () {
        return {
            timeValue: '发送验证码',
            rules: {

            },
            setFormData: {
                username: '',
                tel: '',
                smscode: '',
                newpassword: '',
                password2: '',
            },
            sendStatus: false
        }
    },
    methods: {
        handleSubmit() {

        },
        validateTelRepeat() {

        }
    }
}
</script>

<style>

</style>