/**
 * Module dependencies.
 */
const logger = require('koa-logger')
const koa = require('koa')
// 路由权限控制
const jwt = require('koa-jwt')
const app = new koa()
const Router = require('koa-router')

const prefixRouter = new Router({prefix: '/api'})
const { jwt_secret } = require('./config/secret.js')
const xhr  = require('./router/index.js')

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
    path:[/^\/api\/login/]
}))

prefixRouter.post('/login', xhr.api_user_login)
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
console.log('listening on port 3000');