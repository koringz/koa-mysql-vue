<template>
  <div class="feut-upload-demo">
    <el-upload
      :limit="limit"
      :action="action"
      :file-list="fileList"
      :headers="headers"
      :disabled="disabled"
      :show-file-list="showList"  
      :on-success="successFile"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :before-upload="beforeAvatarUpload"
      list-type="picture">
      <el-button :disabled="disabled" size="small" type="primary"><i class="iconfont iconshangchuan fontsize mr10"></i>{{btnName}}</el-button>
      <div slot="tip" class="el-upload__tip"></div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible" width="40%" center append-to-body :modal="false">
      <div class="img-box"><img :src="dialogImageUrl" class="" alt=""></div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    //按钮名称
    btnName:{
      type:String,
      default:'点击上传'
    },
    otherFileList: {},
    // 上传文件类型
    filetype: {},
    // 上传文件大小
    filesize: {},
    filetypeMsg: {},
    showList:{
      default:true
    },
    // 是否禁用
    disabled:{
      type:Boolean,
      default:false
    },
    //最大允许上传个数
    limit:{
      type:Number,
      default:30
    }
  },
  data() {
    return {
      action: 'api/upload',
      //上传文件头
      headers: {
        Authorization:  'Bearer ' + sessionStorage.getItem('token'),
        // 'x-access-token': sessionStorage.getItem('token')
      },
      fileList: [],
      dialogVisible: false,
      dialogImageUrl:''
    }
  },
  watch: {
    otherFileList: {
      handler(newVal, oldVal) {
        this.fileList = this.getFileFullurl(newVal)
      }
    }
  },
  // 默认显示图片  配置 this.fileList
  mounted() {
    // this.fileList = this.getFileFullurl(this.otherFileList)
    // this.fileList = [
    //       {
    //           name: 'food.jpeg', 
    //           url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
    //       }, 
    //       {
    //           name: 'food2.jpeg', 
    //           url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
    //       }
    //   ]
  },
  methods: {
    mixin_getFileUrl(url) {
      return url
    },
    //补全url全路径
    getFileFullurl(data){
      if(data){
        return data.map(item =>({
            attachFileName:item.attachFileName,
            attachType:item.attachType,
            attachUrl:item.attachUrl,
            name:item.name,
            status:item.status,
            url:this.mixin_getFileUrl(item.url),
          })
        )
      }
    },
    successFile(response, file, fileList) {
      if (response.code === 1) {
        this.$emit('getFileList', fileList)
      }
    },
    beforeAvatarUpload(file) {
      let hasType = true,
        hasSize = true
      if (this.filetype != undefined && this.filetype != '') {
        hasType = this.filetype.includes(this.mixin_getFileExtendingName(file.name).toLowerCase())
        if (!hasType) {
          this.$message.error('上传文件只能是 ' + this.filetypeMsg + ' 格式!')
        }
      }
      if (this.filesize != undefined && this.filesize != '') {
        hasSize = file.size / 1024 / 1024 < this.filesize
        if (!hasSize) {
          this.$message.error('上传文件大小不能超过 ' + this.filesize + 'MB!')
        }
      }
      return hasType && hasSize
    },
    handleRemove(file, fileList) {
      this.$emit('getFileList', fileList)
    },
    handlePreview(file) {
      let fileurl = file.url
      if(file.response && JSON.stringify(file.response)!='{}'){
        fileurl = file.response.data.upfileFullpath
      }
      if(file.attachUrl){
        fileurl = file.attachUrl
      }
      let fileHost = this.mixin_getFileUrl(fileurl)
      this.dialogImageUrl = fileHost
      let ext=['.jpg','.jpeg','.png','.gif']
      if(ext.includes(this.mixin_getFileExtendingName(file.name).toLowerCase())){
        setTimeout(()=>{
          this.dialogVisible = true
        },500)
      }else{0
        this.mixin_iframeTagFile(this.dialogImageUrl+'&filename='+file.name)
      }
    },
    handleExceed() {
      this.$message.warning(`最多上传 ${this.limit} 个文件`);
    },
  }
}
</script>
<style scoped>
.feut-upload-demo{

}
.el-button{
  background:rgba(3,150,255,1);
  color:#fff;
}
.el-upload-list__item .el-icon-close{
  width: 20px;
  height: 20px;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  right: 2px;
  top: 2px;
  background-color: #fe5139;
  color: #ffffff;
}
.el-upload-list{ display: flex; flex-wrap: wrap; margin: 0 -5px;}
.el-upload-list--picture .el-upload-list__item{ 
  width: 70px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 5px;
}
.el-upload-list--picture .el-upload-list__item-name{
  background: transparent;
  width:100%;
  position: absolute;
  left: 0; 
  top: 0;
  z-index: 2;
  text-indent: -9999px;
}
.el-upload-list--picture .el-upload-list__item-thumbnail{
  width: auto;
  height: auto;
  margin-left: 0;
  max-width: 70px;
  max-height: 70px;
}
.el-upload-list--picture .el-upload-list__item-status-label{
  z-index: 9;
}
.el-upload-list__item .el-icon-close{
  z-index: 9;
}
.img-box{
  text-align: center;
}
img{ 
  max-width: 100%;
}
</style>