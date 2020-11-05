<template>
  <div class="feut-modifies-password">
    <el-form :model='setFormData' :rules="rules" ref="ruleForm" label-width="124px" >
      <el-form-item  label="新密码" prop="password">
        <el-input v-model.trim="setFormData.password"></el-input>
      </el-form-item>
      <el-form-item label="确认新密码" prop="repassword">
        <el-input v-model.trim="setFormData.repassword"></el-input>
      </el-form-item>
    </el-form>
    <div class="feut-dialog-footer">
      <el-button size="small" @click="closeModal">取消</el-button>
      <el-button size="small" type="primary" class="btn-next" @click="submit">保 存</el-button>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    var validatePassWord = (rule, value, callback) => {
      if (!String(value).trim()) {
        callback(new Error('请输入密码'))
      } else {
        const reg = /^(?:(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])).{10,18}$/
        if(reg.test(value)) {
          callback()
        }else {
          callback(new Error('10~18位(大小写字母+数字|符号)'))
        }
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.setFormData.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      setFormData: {
        password: '',
        repassword: '',
      },
      rules: {
        password: [ { required: true, validator: validatePassWord, trigger: 'blur' } ],
        repassword: [ { required: true, validator: validatePass2 , trigger: 'blur' } ],
      },
    }
  },
  methods: {
    submit() {
        this.$refs['ruleForm'].validate(valid => {
            if(valid) {
                this.$message.success('修改成功')
            }
        })
    },
    closeModal() {
    }
  },
}
</script>
<style scope>
.feut-dialog-footer{
    text-align: center;
}
</style>