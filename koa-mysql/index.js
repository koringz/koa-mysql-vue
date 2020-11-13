/**
 * Module dependencies.
 */
const koa = require('koa')
const app = new koa()
// 请求接口令牌 json web token 
const jwt = require('koa-jwt')
// 日志信息
const logger = require('koa-logger')
// 路由权限控制
const Router = require('koa-router')
// 文件处理
const multer = require('@koa/multer')
// 数据储存
const Redis = require('ioredis')
// 储存临时数据
const session = require('koa-generic-session')
// 生成 uid
const uid = require('uid2')

const prefixRouter = new Router({prefix: '/api'})
const { jwt_secret } = require('./config/secret.js')
const xhr  = require('./router/index.js')
const RedisSessionStore = require('./lib/redis.js')

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
        console.log('err=',err)
        if (401 == err.status) {
            ctx.status = 401;
            ctx.body = 'Protected resource, use Authorization header to get access\n';
        } else {
            throw err;
        }
    });
});

app.use(jwt({secret: jwt_secret}).unless({
    path:[/^\/api\/login/]
}))

// redis储存
// 实例化一个redisClient 创建客户端
const redisClient = new Redis(
    {
        port: 6379, // Redis port
        host: '127.0.0.1', // Redis host
        // family: 4, // 4 (IPv4) or 6 (IPv6)
       // password: "123456",
        // db: 0
    }
)
// 监听redis错误
redisClient.on("message", (channel, message) => {
    // Receive message Hello world! from channel news
    // Receive message Hello again! from channel music
    console.log("Receive message %s from channel %s", message, channel);
});
const stream = redisClient.scanStream();
stream.on("client", (data) => {
    console.log("client keys have been visited=", data);
});
stream.on("data", (resultKeys) => {
    // `resultKeys` is an array of strings representing key names.
    // Note that resultKeys may contain 0 keys, and that it will sometimes
    // contain duplicates due to SCAN's implementation in Redis.
    for (let i = 0; i < resultKeys.length; i++) {
        console.log('resultKeys=',resultKeys[i]);
    }
});
stream.on("end", () => {
    console.log("all keys have been visited");
});

// 给session加密
app.keys = ['keys zsg'];
const redis_CONFIG = {
    // 浏览器 cookie 里的key
    key: 'sid',
    maxAge: 1000000,
    store: new RedisSessionStore(redisClient)
}
app.use(session(redis_CONFIG, app))

prefixRouter.post('/login', xhr.api_user_login)
prefixRouter.post('/logout', xhr.api_user_logout)
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
const PORT = 3579
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});