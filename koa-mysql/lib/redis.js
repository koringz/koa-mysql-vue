const { json } = require('co-body')
const redis = require('redis')

// 配置
let REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1',
    password: '123456'
}

// 创建客户端
const redisClient = redis.createClient({
    host: REDIS_CONF.host,
    port: REDIS_CONF.port,
})

redisClient.on('error', err => {
    console.log('Redis err')
    console.log(err)
})

// 获得key value
function getRedis (key) {
    return new Promise((resolve, reject) => {
        redisClient.get(key , (err, val) => {
            if(err) {
                reject(err)
                return
            }
            else if(val == null) {
                resolve(null)
                return
            }

            try{
                resolve(JSON.parse(val))
            }
            catch{
                reject(val)
            }
        })
    })
} 

// 设置key value
function setRedis (key, val, timeout = 60 * 60) {
    if(typeof val =='object') {
        val = JSON.stringify(val)
    }
    redisClient.set(key, val)
    redisClient.expire(key, timeout)
}


module.exports = {
    setRedis,
    getRedis
}