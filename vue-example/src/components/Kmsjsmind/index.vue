<template>
  <div class="kmsjsmap-box">
    <div class="kmsjsmap-btn">
      <span class="link-line-descr"></span>
      <span class="link-line-title">关联</span>
      <a id="saveBtn" href="javascript: void(0);" class="sui-btn btn-xlarge btn-primary">保存</a>
      <a id="screenShot" href="javascript: void(0);" class="sui-btn btn-xlarge btn-primary">导出</a>
    </div>

    <div id="jsmind_container"></div>

    <el-dialog
      width="660px"
      title="新增节点"
      append-to-body
      destroy-on-close
      v-if="modal.caseSerialModal"
      :close-on-click-modal="false"
      :visible.sync="modal.caseSerialModal">
      <section>
        <el-form
          size="small"
          :rules="rules"
          ref="ruleForm"
          class="d-content"
          :model="ruleForm"
          label-width="100px">
          <el-form-item label="文本" prop>
            <el-input
              rows="5"
              type="textarea"
              show-word-limit
              maxlength="1000"
              v-model.trim="ruleForm.name"
              placeholder='文本格式如下，描述: 内容'/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="info" @click="closeModal">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </section>
    </el-dialog>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  data() {
    return {
      // 获取id
      currentNode: {},
      // 新增表单
      kmsjsmap: function () {}, 
      ruleForm: {
        name: '',
      },
      rules: {
        name: [{required: true, message: '请输入名字', trigger: 'blur'}]
      },

      vue_kmsjsmap: false,
      modal: {
        caseSerialModal: false
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.init()
    }, 250)
  },
  watch: {
    vue_kmsjsmap: {
      handler(options, oldValue) {
          if(!(options && oldValue)) return;
          let first = (JSON.stringify(options.data)), second = (JSON.stringify(oldValue.data))

          if (first != second) {
            first = JSON.parse(first),  second = JSON.parse(second)
            //   do ajax 数据
          }
      },
      immediate: true
    }
  },
  methods: {
    // 重新赋值
    mixin_returnTree( data, oldChildren = 'children' ) {
        let res = []
        if (Array.isArray(data)) {
            data.map(item => {
                if (item[oldChildren] && item[oldChildren].length) {
                  res.push({
                    id: item['id'],
                    edit: item['edit'],
                    isFile: item['isFile'],
                    topic: item['topic'],
                    name: item['topic'],
                    parentId: item['parentId'],
                    appendLinks: item['appendLinks'],
                    tableType: item['tableType'],
                    children: this.mixin_returnTree(
                        item[oldChildren],
                        oldChildren,
                    )
                  })
                } else {
                  res.push({
                    id: item['id'],
                    edit: item['edit'], // 是否可编辑
                    isFile: item['isFile'], // 是否文件
                    topic: item['topic'],
                    name: item['topic'],
                    parentId: item['parentId'],
                    appendLinks: item['appendLinks'], // 关联id
                    tableType: item['tableType'], // 数字对于信息
                })
              }
            })
        }
        return res
    },
    async init() {
    //   let mmpfull = await this.$api.api_full(1497)
      let mmpfull = {
            "data":
            [{
                "id":"root","topic":"华北大魏有限公司",
                "children":
                [
                        {
                            "id":"easy","topic":"基本信息","direction":"right",
                            "children":[
                                {"id":"easy1","topic":"姓名111"},
                                {"id":"easy2","topic":"姓名111"},
                                {"id":"easy3","topic":"姓名111"},
                                {"id":"easy4","topic":"姓名111"}
                            ]
                        },
                        {
                            "id":"open","topic":"个人信息","direction":"right",
                            "children":[
                                {"id":"open1","topic":"账户213", appendLinks: ['easy']},
                                {"id":"open2","topic":"账户213"}
                            ]
                        }
                ]
            }]
      }
      mmpfull = this.mixin_returnTree(mmpfull.data)[0]
      
      let vueThis = this
      kmsjsmap.init({
        container: 'jsmind_container',
        data: mmpfull,
        editable: true,
        // 触发关联 绑定关联通道
        onRelation: function(item) {
          kmsjsmap.setLinkStatus(
            {
              id: item.id,
              isLink: item.data.isLink === true ? true : true
            },
            true /* 开启 关联*/
          )
        },
        // 完成添加关联节点
        // 第一个参数 当前节点
        // 第二个参数 关联数组 = 被选中节点关联 和 选择节点id
        // 第三个参数 回调方法
        onFinalRelation: function (parent, links, fallback) {
          let appendLinks = links, id = parent.id
          vueThis.$api.api_link({ appendLinks: appendLinks, id: id })
          .then(res => {
            if(res.data.code) {
              vueThis.$message.success(res.data.msg)
              fallback()
            }
            else {
              vueThis.$message.success(res.data.msg)
            }
          })
        },
        // 准备选择清除关联节点
        onDeleteRelation: function(item) {
          kmsjsmap.setDeleteLink(
            {
              id: item.id,
              isLink: item.data.isLink === true ? false : false
            },
            true /* 清除 关联*/
          )
        },
        // 结束 选中清除关联节点
        onFinalDeleteRelation: function (self, nodeOrApp, fallback) {
          vueThis.$api.api_link({ appendLinks: nodeOrApp[1], id: nodeOrApp[0].id })
          .then(res => {
            if(res.data.code) {
              vueThis.$message.success(res.data.msg)
              fallback()
            }
            else {
              vueThis.$message.success(res.data.msg)
            }
          })
        },
        // 创建新节点
        onCreateNode(self, jm, node) {
          vueThis.modal.caseSerialModal = true
          vueThis.kmsjsmap = self
          vueThis.currentNode = node
          // 生成节点
          // self.add_node("nid", "name")
        },
        // 删除 节点
        onDeleteNode(self, jm, node, fallback) {
          let id = node.id;
          vueThis.$api.api_del(id)
          .then(res => {
            if(res.data.code == 1) {
              vueThis.$message.success(res.data.msg)
              fallback()
            }
            else{
              vueThis.$message.success(res.data.msg)
            }
          })
        },
        // 编辑 数据
        onEditeNodeData(self, evt, fallback) {
          let  id = self.selected_node.id
          let name = evt.target.value

          // 不可编辑
          if(typeof self.selected_node.data.edit === 'boolean' && !self.selected_node.data.edit) {
            var node = self.editing_node;
            self.jm.update_node(node.id, node.topic);
            vueThis.$message('当前节点不可编辑')
            return false
          }

          vueThis.$api.api_update({id, name})
          .then(res => {
            if(res.data.code) {
              vueThis.$message.success(res.data.msg)
              fallback()
            }
            else {
              var node = self.editing_node;
              self.jm.update_node(node.id, node.topic);
              vueThis.$message.success(res.data.msg)
            }
          })
        },
        // 获得数据 方法
        onKoringzData(type, data) {
          let getNewData = this.view.jm.get_data()
          vueThis.vue_kmsjsmap = getNewData
        }
      })

      $('#saveBtn').click(function() {
          kmsjsmap.save(function(data) {
          })
      })

      $('#screenShot').click(function() {
          kmsjsmap.screenshot()
      })
    },
    closeModal() {
      this.modal.caseSerialModal = false
    },
    submitForm() {
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          let params = this.ruleForm
          let api_name = this.getNewNodeType()
          params.parentId = this.currentNode.id
          this.$api[api_name](params).then(res => {
            if (res.data.code == 1) {
              this.closeModal()
              // 执行添加节点数据
              this.kmsjsmap.add_node(res.data.data, params.name)
              this.$message.success(res.data.msg)
              this.ruleForm.name = ''
            } else {
              this.$message.error(res.data.msg)
            }
          })
        }
      })
    },
    getNewNodeType() {
        let api_name ='api_add'
        switch (this.currentNode && this.currentNode.data && this.currentNode.data.tableType){
          case 1:
            api_name = 'api_add'
            break;
        }
        return api_name
    }
    
  }
}
</script>
<style>
#jsmind_container {
  background-color: var(--case-detail-bg);
}
.kmsjsmap-btn {
  position: absolute;
  z-index: 100;
  right: 24px;
  height: 64px;
  line-height: 64px;
  padding-right: 10px;
  color: black;
}
.kmsjsmap-btn a {
  color: #eeefef;
  font-size: 14px;
  margin-right: 10px;
  background-color: #4285f4;
  padding: 10px 18px;
  border-radius: 6px;
}
.link-line-descr {
  border: 1px dashed #5e8def;
  width: 30px;
  height: 1px;
  display: inline-block;
  vertical-align: middle;
}
.link-line-title {
  padding-right: 20px;
  color: #eeefef;
}
.lui-jsmind-innerToolBar {
  position: absolute;
  bottom: 68px;
  height: 44px;
  right: 24px;
  width: 44px;
  text-align: center;
  font-size: 12px;
  z-index: 99;
  background: #bdbd31;
}
.lui-jsmind-innerToolBar li {
  cursor: pointer;
  height: 30px;
  color: white;
  background-color: #4285f4;
  border-bottom: 1px solid #d9d9d9;
}
.kmsjsmap-dropdown-menu {
  background-color: #4285f4;
}
.kmsjsmap-dropdown-menu li a {
  color: white;
}
.kmsjsmap-dropdown-menu li:hover {
  background-color: #e0eaff;
}
.kmsjsmap-dropdown-menu li:hover a {
  color: #4285f4;
  background-color: transparent;
}
</style>