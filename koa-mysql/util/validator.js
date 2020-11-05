let Ajv = require('ajv');
var ajv = new Ajv();

// 验证方法
// 列表
// ctx 默认koa context
//  params 表示JOSN对象
module.exports.ajv_validator_userform = (_query, params) => {
  let keys = Object.keys(params)
  let obj = {}
  for(let items in params) {
      obj[items] =  {
        type: params[items]
      }
  }

  var mySchema = {
    type : "object",
    required: keys,
    properties: obj
  }

  let validate = ajv.compile(mySchema)
  let valid = validate(_query)

  console.log('valid==',valid)
  if (!valid) console.log(validate.errors)
  
  return valid
}