class Resolve {
  constructor(options) {
      this.options =  options
  }
  
  json(data, message = '成功', errorCode = 0, code = 1) {
    return {
      code,
      message,
      errorCode,
      data
    }
  }

  success(message = '成功', errorCode = 0, code = 1) {
    return {
      message,
      code,
      errorCode
    }
  }

  error(message = '失败', errorCode = 0, code = 0) {
    return {
      message,
      code,
      errorCode
    }
  }
}
  
  module.exports = Resolve