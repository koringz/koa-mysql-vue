<template>
    <div class="feut-menu">
        <el-col :span="24" style="height: 100%">
            <el-menu router @close="handleClose" @select='handleSelect' :default-active="$route.path" class="el-menu-vertical-demo" text-color="#fff" active-text-color="#409EFF">
                <el-menu-item index='/home' >
                    <i class="el-icon-setting"></i>
                    <span slot="title">操作</span>
                </el-menu-item>
                <el-menu-item index="/grid">
                    <i class="el-icon-share"></i>
                    <span slot="title">数据表</span>
                </el-menu-item>
                <el-menu-item index="/usertable">
                    <i class="el-icon-user"></i>
                    <span slot="title">用户表</span>
                </el-menu-item>
                <el-menu-item index="/viewimage">
                    <i class="el-icon-picture-outline"></i>
                    <span slot="title">查看图片</span>
                </el-menu-item>
                <el-menu-item index="/managemessage">
                    <i class="el-icon-s-order"></i>
                    <span slot="title">用户管理信息</span>
                </el-menu-item>
                <el-menu-item index="/addshopping">
                    <i class="el-icon-s-fold"></i>
                    <span slot="title">添加商品</span>
                </el-menu-item>
                <el-menu-item index="/modifiespassword">
                    <i class="el-icon-tickets"></i>
                    <span slot="title">修改密码</span>
                </el-menu-item>
                <el-menu-item index="/findpassword">
                    <i class="el-icon-document"></i>
                    <span slot="title">找回密码</span>
                </el-menu-item>
                <el-menu-item index="/uploadfile">
                    <i class="el-icon-folder"></i>
                    <span slot="title">上传</span>
                </el-menu-item>
                <el-menu-item index="/clip">
                    <i class="el-icon-document-checked"></i>
                    <span slot="title">复制</span>
                </el-menu-item>
                <el-menu-item >
                    <i class="el-icon-grape"></i>
                    <span slot="title">图表</span>
                </el-menu-item>
                <el-menu-item >
                    <i class="el-icon-edit-outline"></i>
                    <span slot="title">编辑</span>
                </el-menu-item>
                <el-menu-item index="/citymap">
                    <i class="el-icon-map-location"></i>
                    <span slot="title">地图</span>
                </el-menu-item>
                <el-menu-item index="/antv">
                    <i class="el-icon-share"></i>
                    <span slot="title">脑图</span>
                </el-menu-item>
                <el-menu-item index="/jsmind">
                    <i class="el-icon-lollipop"></i>
                    <span slot="title">jsmind-脑图</span>
                </el-menu-item>
            </el-menu>
        </el-col>
    </div>
</template>

<script>
 export default {
    methods: {
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      },
      handleSelect() {

      }
    }
  }
</script>

<style scoped>
.feut-menu{
    position: absolute;
    width: 280px;
    top: 0;
    bottom: 0;
    overflow: auto;
   
}
 .el-menu{
    height: 100%;
    width: 100%;
    overflow: auto;
    border-right-color: #363f77;
    background-color: #1e2f4e !important;
}
.el-menu-vertical-demo{
    height: 100%;
}
.el-menu-item i,
.el-menu-item{
    color: #8ea6ca !important;
    font-size: 14px;
    font-weight: 600;
}
.el-menu-item:hover,
.el-menu-item.is-active:hover,
.el-menu-item.is-active{
    background-color: #011627 !important;
}
</style>