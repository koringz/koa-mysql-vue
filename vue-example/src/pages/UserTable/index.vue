<template>
    <div>
        <div class="feut-table">
            <el-table
                row-key="id"
                :data="TableData"
                v-loading='loading'
                @filter-change='handleFilterChange'
                @selection-change='handleAllSelectionChange'>
                <el-table-column :show-overflow-tooltip='true' prop="tableName" label="名称">
                    <template slot-scope="scope">
                        {{ scope.row.tableName != '' ? scope.row.tableName : '无'}}
                    </template>
                </el-table-column>
                <el-table-column :show-overflow-tooltip='true' prop="tableAccount" label="账号">
                    <template slot-scope="scope">
                        {{ scope.row.tableAccount != '' ?  scope.row.tableAccount :  '无'}}
                    </template>
                </el-table-column>
                <el-table-column :show-overflow-tooltip='true' prop="tableBank" label="银行">
                    <template slot-scope="scope">
                        {{ scope.row.tableBank != '' ? scope.row.tableBank : '无' }}
                    </template>
                </el-table-column>
                <el-table-column :show-overflow-tooltip='true' prop="tablePeople" label="开户人">
                    <template slot-scope="scope">
                        {{scope.row.tablePeople != '' ? scope.row.tablePeople : '无' }}
                    </template>
                </el-table-column>
                <el-table-column :show-overflow-tooltip='true' prop="tableStatus" label="状态">
                    <template slot-scope="scope">
                        {{ scope.row.tableStatus != '' ? scope.row.tableStatus : '无' }}
                    </template>
                </el-table-column>
                <el-table-column :show-overflow-tooltip='true' prop="tableTime" label="处理时间">
                    <template slot-scope="scope">
                        {{ scope.row.tableTime != '' ? scope.row.tableTime : '无' }}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <a @click="handleAdd(scope.row, scope.$index)">添加</a> &nbsp;&nbsp;
                        <a @click="handleDelete(scope.row, scope.$index)">删除</a>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="feut-pagination">
            <el-pagination
                background
                prev-text='上一页'
                next-text='下一页'
                :total="pagTable.total"
                :current-page="pagTable.page"
                :page-size.sync="pagTable.size"
                :pager-count="pagTable.count"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                layout="total, sizes, prev, pager, next, jumper"/>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            TableData: [
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
            pagTable: {
                total: 100,
                size: 10,
                page: 2,
                count: 5,
            }
        }
    },
    methods: {
        handleFilterChange () {

        },
        handleAllSelectionChange () {

        },
        handleSizeChange () {

        },
        handleCurrentChange () {

        },
        handleAdd () {

        },
        handleDelete () {

        },
        
    }
}
</script>

<style>
</style>