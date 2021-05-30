<template>
    <div>
        <template>
            <section class="operation-category">
                <el-form inline :model="searchForm" label-width="60px" ref="operationResetForm" class="demo-form-inline" @submit.native.prevent>
                    <el-form-item prop="tableName" style="margin-right: 60px">
                        <el-input v-model.trim="searchForm.tableName" clearable placeholder="请输入名称"  @change='searchBy' style="width: 360px">
                        </el-input>
                    </el-form-item>
                    <!-- <el-form-item label="银行" prop="submitType" style="margin-right: 60px">
                        <el-select v-model.trim="searchForm.submitType" @change='searchBy' clearable placeholder="请选择" style="width: 360px">
                            <el-option
                                :key="item.roleId" 
                                :value="item.roleId" 
                                :label="item.roleName"
                                v-for="item in submitTypeList"/>
                        </el-select>
                    </el-form-item> -->
                    <!-- <el-form-item label="处理时间" prop='date' style="margin-right: 60px">
                        <el-date-picker 
                            clearable
                            style="width: 360px"
                            type="daterange"
                            range-separator="→"
                             @change='searchBy'
                            value-format="yyyy-MM-dd"
                            :picker-options="pickerOptions"
                            v-model.trim="searchForm.date"
                            end-placeholder="处理结束时间"
                            start-placeholder="处理开始时间"
                            popper-class="custom-date-panel"/>
                    </el-form-item> -->
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-search" @click="searchBy" style="background-color: #7c9b5d;">搜索</el-button>
                        <el-button type="info" icon="el-icon-share" @click="resetSearch" style="background-color: #586b92">重置</el-button>
                        <!-- <el-button type="text" @click="report">导出</el-button>
                        <el-button type="text" @click="addShoppingData">添加新数据</el-button> -->
                    </el-form-item>
                </el-form>
            </section>
        </template>

        <template>
            <section class="feut-table">
                <el-table :data="tableData" v-loading='loading' @filter-change='handleFilterChange' @selection-change='handleAllSelectionChange' @sort-change="sortChange" ref="operatorClearSort" >
                    <el-table-column type="selection" width="55" align='center'></el-table-column>
                    <el-table-column show-overflow-tooltip min-width="100px" prop="name" label="名称"></el-table-column>
                    <el-table-column show-overflow-tooltip min-width="100px" sortable prop="code" label="账号"></el-table-column>
                    <el-table-column show-overflow-tooltip min-width="100px" prop="type" label="类型" width="100"></el-table-column>
                    <el-table-column show-overflow-tooltip min-width="200px" sortable prop="description" label="描述" ></el-table-column>
                    <el-table-column show-overflow-tooltip label="状态">
                        <template slot-scope="scope">
                            <el-switch :value="scope.row.tableStatus" @change="switchStatus(scope.row, scope.$index)"></el-switch>
                        </template>
                    </el-table-column>
                    <el-table-column show-overflow-tooltip min-width="100px" prop="create_times" label="处理时间"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <a @click="handleAdd(scope.row, scope.$index)" style="color:#da8018">添加</a> &nbsp;&nbsp;
                            <el-tooltip class="item" effect="dark" content="删除" placement="bottom">
                                <el-popover
                                    width="160"
                                    trigger="click"
                                    placement="bottom"
                                    popper-class="self-popover"
                                    :ref="'popover-' + scope.$index">
                                    <div class="popover-content text-center" style="text-align: center;padding: 10px;"><p>确定要删除吗？</p></div>
                                    <div class="popover-footer text-center pt10 tc" style="text-align: center;padding: 10px;">
                                        <el-button type="danger" size="mini" class="btn-default-8" @click="pCancel(scope.$index)">取消</el-button>
                                        <el-button type="info" size="mini" class="btn-default-7" @click="handleDelete(scope.row, scope.$index)">确定</el-button>
                                    </div>
                                    <el-button type="text" slot="reference" size="small" style="color:rgb(159, 210, 37)">删除</el-button>
                                </el-popover>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                </el-table>
            </section>
        </template>

        <template>
            <section class="feut-pagination">
                <el-pagination
                    background
                    prev-text='上一页'
                    next-text='下一页'
                    :total="page.total"
                    :pager-count="page.count"
                    :page-size.sync="page.size"
                    :current-page="page.index"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    layout="total, sizes, prev, pager, next, jumper"/>
            </section>
        </template>
    </div>
</template>

<script>
import qs from 'qs'
export default {
    data() {
        return {
            // 日期控件快捷选项
            pickerOptions: {
                shortcuts: [{
                text: '最近一周',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', [start, end]);
                }
                }, {
                text: '最近一个月',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    picker.$emit('pick', [start, end]);
                }
                }, {
                text: '最近三个月',
                onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                    picker.$emit('pick', [start, end]);
                }
                }]
            },

            searchForm: {
                tableName: '',
                date: [],
                submitType: '',
            },
            submitTypeList: [
                {roleId: 'REGISTER', roleName: '中国银行' },
                {roleId: 'MODIFY', roleName: '农业银行' },
            ],

            sortOperator: {
                tableBankSort: '',
                tableAccountSort: '',
            },
            tableData: [
                {
                    tableName: '卡号挂失',
                    tableAccount: '',
                    tableBank: '中国银行',
                    tablePeople: '张三',
                    tableStatus: false,
                    tableTime: '2020-06-10'
                },
                {tableName: '卡号挂失'},
                {tableName: '卡号挂失'},
                {tableName: '卡号挂失'},
                {tableName: '卡号挂失'},
                {tableName: '卡号挂失'},
                {tableName: '卡号挂失'},
            ],
            loading: false,
            page: {
                total: 100,
                size: 10,
                index: 1,
                count: 5,
            }
        }
    },
    watch: {
    },
    created() {
        this.handleList()
    },
    methods: {
        // 搜索 search
        searchBy() {
            this.page.index = 1
            this.handleList()
        },
        resetSearch() { 
            // 重置
            this.$refs.operationResetForm.resetFields()
            this.$refs.operatorClearSort.clearSort()
            this.handleSortParams()
            this.page.index = 1
            this.page.size = 10
            this.handleList()
        },
        handleSortParams() {
            let arr = Object.keys(this.sortOperator)

            let that = this
            arr.map(item => {
                if(item) {
                    that.sortOperator[item] = ''
                }
            })
        },
        report () {
            // 导出
            let params = this.getParams()
            window.location.href = `/api/grid?${qs.stringify(params)}`
        },
        getParams() {
            let search_data = this.searchForm.tableName
            let create_times = this.searchForm.date && this.searchForm.date.length ? this.searchForm.date[0] +' 00:00:00': ''
            let updated_times = this.searchForm.date && this.searchForm.date.length ? this.searchForm.date[1] +' 23:59:59': ''

            let page_index = this.page.index
            let page_size = this.page.size
            
            let params = { search_data, create_times, updated_times, page_index, page_size }
            return this.mixin_filterParams(params)
        },
        // 显示 table
        handleList () {
            let params = this.getParams()
            this.$api.api_user_list(params)
            .then(res => {
                if (res.data.code) {
                    this.tableData  =   res.data.data
                    this.page.total =   res.data.total || 0
                }
            }) .catch(error => console.log(error))
        },
        handleFilterChange () {

        },
        handleAllSelectionChange () {

        },
        // 操作 table
        sortChange(sortData) {
            this.page.index = 1
            this.mixin_tableSort(sortData, 'handleList')
        },
        mixin_tableSort(sortData, getDataMethod) { //表格列-排序
            let arr = Object.keys(this.sortOperator)
            let _props = sortData.prop + 'Sort'
            if (sortData.order === 'ascending') {
                this.sortOperator[_props] = false
            }else if (sortData.order === 'descending') {
                this.sortOperator[_props] = true
            }else if (sortData.order === null) {
                this.sortOperator[_props] = ''
            }
            arr.map(item => {
                if (item !== _props) {
                this.sortOperator[item] = ''
                }
            })
            this[getDataMethod]()
        },
        switchStatus(row, index) {
            // let params = { id: row.id, tableStatus: row.tableStatus == "NORMAL" ? "SHIELDING" : "NORMAL" }
            this.tableData[index]['tableStatus'] = !this.tableData[index]['tableStatus'] 
        },
        addShoppingData () {
        },
        handleSizeChange (size) {
            this.page.size = size
            this.page.index = 1
            this.handleList()
        },
        handleCurrentChange (index) {
            this.page.index = index
            this.handleList()
        },
        mixin_filterParams(obj) {
            var _newPar = {};
            for (var key in obj) {
                if ((obj[key] === 0 || obj[key] === false || obj[key]) && obj[key].toString().replace(/(^\s*)|(\s*$)/g, '') !== '') {
                    _newPar[key] = obj[key];
                }
            }
            return _newPar;
        },
        handleAdd(row, index) {

        },
        handleDelete(row, index) {
            this.handleList()
            this.pCancel(index)
        },
        pCancel(index) {
            this.$refs[`popover-` + index].doClose()
        },
    }
}
</script>

<style>
.feut-pagination {

}

/* checkbox */
.el-checkbox__inner{
    background-color: transparent;
}
.el-switch__core:after{
    background-color: #9fd225;
}
.el-switch__core{
    background-color: #1e2f4e;
}
</style>