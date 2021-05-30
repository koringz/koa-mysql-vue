<template>
  <div class="feut-shopping">
      <div class="feut-shopping-form-box">
        <el-form :model="setFormData" :rules="addRules" ref="setFormData" label-width="120px">
          <el-form-item prop="name" label="名称">
            <el-input v-model.trim="setFormData.name" placeholder="请输入名称"/>
          </el-form-item>
          <el-form-item prop="name" label="商品编号">
            <el-input v-model.trim="setFormData.shopCode" placeholder="请输入商品编号"/>
          </el-form-item>
          <el-form-item prop="mobileType" label="*类型">
            <el-select v-model.trim="setFormData.mobileType" placeholder="请选择">
              <el-option v-for="item in mobileTypeList" :key="item.value" :value="item.value" :label="item.label"/>
            </el-select>
          </el-form-item>
          <el-form-item prop='address' label="地址">
              <el-input 
                :rows="4"  
                type="textarea" 
                show-word-limit 
                :maxlength='255' 
                placeholder="输入详细地址"
                v-model="setFormData.address"/>
          </el-form-item>
          <el-form-item prop="date" label="添加日期" >
            <el-date-picker
              clearable
              type="daterange"
              range-separator="→"
              value-format="yyyy-MM-dd"
              end-placeholder="添加结束日期"
              start-placeholder="添加开始日期"
              v-model.trim="setFormData.date"
              popper-class="custom-date-panel"
              :picker-options="pickerOptionsAfter"/>
          </el-form-item>
          <el-form-item prop='policeStation' label="所属单位" >
              <el-cascader
                  clearable
                  placeholder="所属单位"
                  popper-class="self-cascader"
                  :props="{ checkStrictly: true }"
                  v-model="setFormData.policeStation"/>
          </el-form-item>
          <el-form-item prop='policeStation' label="所属单位" >
              <el-cascader
                  clearable
                  placeholder="所属单位"
                  popper-class="self-cascader"
                  :props="{ checkStrictly: true }"
                  v-model="setFormData.policeStation"/>
          </el-form-item>
          <el-form-item prop='policeStation' label="所属单位" >
              <el-cascader
                  clearable
                  placeholder="所属单位"
                  popper-class="self-cascader"
                  :props="{ checkStrictly: true }"
                  v-model="setFormData.policeStation"/>
          </el-form-item>
          <el-form-item prop='policeStation' label="所属单位" >
              <el-cascader
                  clearable
                  placeholder="所属单位"
                  popper-class="self-cascader"
                  :props="{ checkStrictly: true }"
                  v-model="setFormData.policeStation"/>
          </el-form-item>
          <el-form-item label="上传文件" :rules="[{ required: true }]">
            <el-upload
              :limit="1"
              ref="fileUpload"
              :multiple="false"
              :action="urladdress"
              :headers="headers"
              :on-error="handleError"
              :accept="fileSuffix.toString()"
              :on-exceed="handleExceed"
              :on-success="handleSuccess"
              :on-remove="handleRemove"
              :before-upload="beforeUpload">
              <el-button size="small" type="primary">上传文件</el-button>
              <div slot="tip" style="color:#999; font-size: 10px;">提示：上传文件格式必须为{{fileSuffix.toString()}}且不能大于50M</div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <div class="feut-dialog-footer">
        <el-button size="small" @click="cancelSubmit">取消</el-button>
        <el-button size="small" type="primary" class="btn-next" @click="submitForm">确定</el-button>
      </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            urladdress: '/api/file/upload',
            addRules: {
                name: [ { required: true, trigger: 'blur' } ],
                mobileType: [ { required: true, trigger: 'blur' } ],
                address: [ { required: true, trigger: 'blur' } ],
                date: [ { required: true, trigger: 'blur' } ],
            },
            setFormData: {
                name: '',
                shopCode: '',
                mobileType: 'ANDROID_TYPE',
                policeStation: '',
                address: '',
                date: [],
            },
            pickerOptionsAfter: {
              disabledDate(time) {
                return time.getTime() <= (Date.now()-(24 * 60 * 60 * 1000));
              },
            },
            // list 数组数据
            mobileTypeList: [
              { value: 'ANDROID_TYPE', label: '政治敏感' },
              { value: 'IPHONE_TYPE', label: '迷信邪教' },
              { value: 'IPHONE_TYPE1', label: '低俗辱骂' },
            ],
            headers: {},
            pakage: {
              filePath: '',
              fileSize: '',
              fileMd5: '',
              filename: '',
            },
            fileSuffix: ['.exe','.zip','.xlsx','xls'],
            
            isLoading: false
        }
    },
    methods: {
        // 提交
        submitForm() {
          this.$refs.setFormData.validate(valid => {
            if(valid) {
              // 校验程序包
              if(!this.pakage.filePath || !this.pakage.fileSize) {
                this.$message.warning('请上传程序包')
                return
              }

              let params = {...this.setFormData, ...this.pakage}
            }
          })
        },
        // 重置
        cancelSubmit() {
          this.$emit('onClose')
        },

        // 文件
            
        beforeUpload(file) {      
          const types = this.fileSuffix
          let suffix = file.name.split('.')
          suffix = '.' + suffix[suffix.length-1]
          if(types.indexOf(suffix) === -1) {
            this.$message.error(`上传的文件类型只能是${this.fileSuffix.toString()}`)
            return false
          }
          if((file.size /1024 /1024) > 100) {
            this.$message.error('文件不可大于100M')
            return false
          }      
        },
        handleSuccess(response, file, fileList) {
          // 上传文件之后 
          // 后台返回数据
          if(response.code === 1) {
            this.pakage.filePath = response.data.upfileFullpath
            this.pakage.fileSize = response.data.fileByteSize
            this.pakage.fileMd5 = response.data.fileMd5
            this.pakage.filename = response.data.upfileName
            this.$message.success('上传成功')
          }      
        },
        handleError(err, file, fileList) {
          this.$message.error('上传失败', + err)
        },
        handleExceed(files, fileList) {
          this.$message.warning(`${files[0].name}上传失败，只能上传一个格式为${this.fileSuffix.toString()}`)      
        },
        handleRemove(file, fileList) {
          this.pakage = {
            filePath: '',
            fileSize: '',
            fileMd5: '',
            filename: '',
          }
        },
    }
}
</script>

<style scoped>
.feut-dialog-footer{
    text-align: center;
}
</style>