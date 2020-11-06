import xhr_axios from '@/utils/axios/index.js';
export default {
    api_login: (options) => xhr_axios.post('/api/login', options, 'json'), // 登录
    api_list: (options) => xhr_axios.get('/api/list', options, 'json'), // 用户信息
    api_user_list: (options) => xhr_axios.get('/api/userlist', options, 'json'), // 用户列表
    api_user_form: (options) => xhr_axios.post('/api/userform', options, 'json'), // 用户表单
    api_delete_item: (options) => xhr_axios.post('/api/deleteitem', options, 'json'), // 删除数据
    api_add_case: (options) => xhr_axios.post('/api/addcase', options, 'json'), // 添加数据
    api_detail_list: (options) => xhr_axios.get('/api/detaillist', options, 'json'), // 详情信息
    api_access_file: (options) => xhr_axios.get('/api/accessfile', options, 'json'), // 访问文件
    api_download_file: (options) => xhr_axios.get('/api/downloadfile', options, 'json'), // 下载文件
}