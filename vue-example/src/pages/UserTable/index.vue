<template>
    <div>
        
        <template>
            <div class="feut-table">
                <el-table
                    row-key="id"
                    :data="tableData"
                    v-loading='loading'
                    @filter-change='handleFilterChange'
                    @selection-change='handleAllSelectionChange'>
                    <el-table-column show-overflow-tooltip min-width="100px" prop="name" label="名称"></el-table-column>
                    <el-table-column show-overflow-tooltip min-width="100px" sortable prop="path" label="路径"></el-table-column>
                    <el-table-column show-overflow-tooltip min-width="100px" sortable prop="size" label="大小"></el-table-column>
                    <el-table-column show-overflow-tooltip min-width="100px" sortable prop="type" label="类型"></el-table-column>
                    <el-table-column show-overflow-tooltip min-width="100px" sortable prop="upload_time" label="时间"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <a @click="handleAdd(scope.row, scope.$index)">添加</a> &nbsp;&nbsp;
                            <a @click="handleDelete(scope.row, scope.$index)">删除</a>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </template>

        <template>
            <div class="feut-pagination">
                <el-pagination
                    background
                    prev-text='上一页'
                    next-text='下一页'
                    :total="page.total"
                    :current-page="page.index"
                    :page-size.sync="page.size"
                    :pager-count="page.count"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    layout="total, sizes, prev, pager, next, jumper"/>
            </div>
        </template>

    </div>
</template>

<script>
export default {
    data() {
        return {
            tableData: [
                {
                    id: 1,
                    tableName: '卡号挂失',
                    tableAccount: '',
                    tableBank: '中国银行',
                    tablePeople: '张三',
                    tableStatus: '',
                    tableTime: '2020-06-10',
                    children: [
                        {
                            id: '122',
                            tableName: '卡号挂失',
                            tableAccount: '',
                            tableBank: '中国银行',
                            tablePeople: '张三',
                            tableStatus: '',
                            tableTime: '2020-06-10',
                        }
                    ]
                },
                {
                    id: 2,
                    tableName: '卡号挂失',
                    tableAccount: '',
                    tableBank: '中国银行',
                    tablePeople: '张三',
                    tableStatus: '',
                    tableTime: '2020-06-10',
                    children: [
                        {
                            id: '123',
                            tableName: '卡号挂失',
                            tableAccount: '',
                            tableBank: '中国银行',
                            tablePeople: '张三',
                            tableStatus: '',
                            tableTime: '2020-06-10',
                        }
                    ]
                },
                {
                    id: 3,
                    tableName: '卡号挂失',
                    tableAccount: '',
                    tableBank: '中国银行',
                    tablePeople: '张三',
                    tableStatus: '',
                    tableTime: '2020-06-10',
                    children: [
                        {
                            id: '124',
                            tableName: '卡号挂失',
                            tableAccount: '',
                            tableBank: '中国银行',
                            tablePeople: '张三',
                            tableStatus: '',
                            tableTime: '2020-06-10',
                        }
                    ]
                },
                {
                    id: 4,
                    tableName: '卡号挂失',
                    tableAccount: '',
                    tableBank: '中国银行',
                    tablePeople: '张三',
                    tableStatus: '',
                    tableTime: '2020-06-10',
                    children: [
                        {
                            id: '125',
                            tableName: '卡号挂失',
                            tableAccount: '',
                            tableBank: '中国银行',
                            tablePeople: '张三',
                            tableStatus: '',
                            tableTime: '2020-06-10',
                        }
                    ]
                },
                {
                    id: 5,
                    tableName: '卡号挂失',
                    tableAccount: '',
                    tableBank: '中国银行',
                    tablePeople: '张三',
                    tableStatus: '',
                    tableTime: '2020-06-10',
                    children: [
                        {
                            id: '126',
                            tableName: '卡号挂失',
                            tableAccount: '',
                            tableBank: '中国银行',
                            tablePeople: '张三',
                            tableStatus: '',
                            tableTime: '2020-06-10',
                        }
                    ]
                },
                {
                    id: 6,
                    tableName: '卡号挂失',
                    tableAccount: '',
                    tableBank: '中国银行',
                    tablePeople: '张三',
                    tableStatus: '',
                    tableTime: '2020-06-10',
                    children: [
                        {
                            id: '127',
                            tableName: '卡号挂失',
                            tableAccount: '',
                            tableBank: '中国银行',
                            tablePeople: '张三',
                            tableStatus: '',
                            tableTime: '2020-06-10',
                        }
                    ]
                },
                {
                    id: 7,
                    tableName: '卡号挂失1',
                    tableAccount: '',
                    tableBank: '中国银行',
                    tablePeople: '张三',
                    tableStatus: '',
                    tableTime: '2020-06-10',
                    children: [
                        {
                            id: '130',
                            tableName: '卡号挂失2',
                            tableAccount: '',
                            tableBank: '招商银行',
                            tablePeople: '张三',
                            tableStatus: '',
                            tableTime: '2020-06-10',
                            children: [
                                {
                                    id: '129',
                                    tableName: '卡号挂失3',
                                    tableAccount: '',
                                    tableBank: '工商银行',
                                    tablePeople: '张三',
                                    tableStatus: '',
                                    tableTime: '2020-06-10',
                                    hasChildren: false,
                                }
                            ]
                        }
                    ]
                },
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
    created() {
        this.handleList()
    },
    methods: {
        handleFilterChange () {

        },
        handleAllSelectionChange () {

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
        handleAdd () {

        },
        handleDelete () {

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
        getParams() {
            let page_index = this.page.index
            let page_size = this.page.size
            
            let params = { page_index, page_size }
            return this.mixin_filterParams(params)
        },
        // 显示 table
        handleList () {
            let params = this.getParams()
            this.$api.api_access_file(params)
            .then(res => {
                if (res.data.code) {
                    if(res.data.data.length) {
                        res.data.data[res.data.data.length-1].children = [
                            {
                                id: '123',
                                name: '123'
                            }
                        ]
                    }

                    this.tableData  =   res.data.data
                    this.page.total =   res.data.total || 0
                }
            }) .catch(error => console.log(error))
        },
        
    }
}
</script>

<style>
</style>