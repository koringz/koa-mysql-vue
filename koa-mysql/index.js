/**
 * Module dependencies.
 */
const logger = require('koa-logger')
const koa = require('koa')
// 路由权限控制
const jwt = require('koa-jwt')
const app = new koa()
const Router = require('koa-router')
const multer = require('@koa/multer');

const prefixRouter = new Router({prefix: '/api'})
const { jwt_secret } = require('./config/secret.js')
const xhr  = require('./router/index.js')

// 上传文件
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public_files")
    },
    filename: function (req, file, cb) {
        const filename = file.originalname.split(".")
        cb(null, `${Date.now()}_${filename[0]}.${filename[filename.length - 1]}`)
    }
})

const upload = multer({storage})

// Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use(function(ctx, next){
    return next().catch((err) => {
        console.log(err)
        if (401 == err.status) {
            ctx.status = 401;
            ctx.body = 'Protected resource, use Authorization header to get access\n';
        } else {
            throw err;
        }
    });
});

app.use(jwt({secret: jwt_secret}).unless({
    path:[/^[\/api\/login|\/file]/]
}))

prefixRouter.post('/login', xhr.api_user_login)
prefixRouter.post('/upload', upload.single('file'), xhr.api_upload)
prefixRouter.get('/accessfile', xhr.api_access_file)
prefixRouter.get('/downloadfile', xhr.api_download_file)
prefixRouter.get('/userlist', xhr.api_userlist)
prefixRouter.post('/deleteitem', xhr.api_delete_item)
prefixRouter.post('/addcase', xhr.api_add_case)
prefixRouter.get('/detaillist', xhr.api_detail_list)

// middleware
app.use(logger());
app.use(prefixRouter.routes());
// http请求参数验证
app.use(prefixRouter.allowedMethods());

// listen
app.listen(3579);
console.log('listening on port 3579');