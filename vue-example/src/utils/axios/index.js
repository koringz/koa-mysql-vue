import axios from 'axios'
import qs from 'qs'
import router from '@/router/index.js'
import {Message} from 'element-ui'

let service = axios.create(function () {
    return {
      timeout: 5000
    }
})

const request = (method, url, options, acceptType, blob) => {
  return new Promise((resolve, reject) => {
    let headers = {}
    const token = sessionStorage.getItem('token')
    const formData = acceptType === 'json' ? options ? options : {}: qs.stringify(options)
    headers['content-type'] = acceptType === 'json' ? 'application/json;charset=UTF-8' : 'application/x-www-form-urlencoded'
    
    if (token && url.indexOf('login') < 0) {
      headers['Authorization'] = 'Bearer ' + token
    }

    let payload = { url, method, headers }
    if (['get'].includes(method)) {
      payload.params = formData
      if(blob) {
        payload.responseType = blob
      }
    }
    else if (['post','put','delete'].includes(method)) {
      payload.data = formData
    }

    //  添加时间戳
    if(['post'].includes(method)){
      payload.url = payload.url.indexOf('?') > 0 ? `${payload.url}&t=${(new(Date)).getTime()}` : `${payload.url}?t=${(new(Date)).getTime()}`
    }

    service(payload).then(res => {
      if(blob) {
        resolve(res)
      }
      else{
        if(res.data.code === 1 || res.data.code === 0) { 
          resolve(res)
        }else { 
          Message.closeAll()
          Message.error(res.data.message)
          reject(res)
        }
      }
    }, error => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            router.push({ path: '/login' })
        }
      }
      return Promise.reject(error)
    }).catch(err => { //响应失败
      if (err.response && err.response.status === 401) {
        if (router.currentRoute.path !== '/login' ) {
          router.push({ path: '/login' })
        }
      }
      else {
        Message.closeAll()
        Message.error(err.response.data.message)
      }
      reject(err)
    })
  })
}

const xhr =  {
	get (url, options, acceptType, blob) {
		return request('get', url, options, acceptType, blob);
	},
	post (url, options, acceptType = 'json', blob) {
		return request('post', url, options, acceptType, blob);
	},
	put (url, options, acceptType = 'json') {
		return request('put', url, options, acceptType);
	},
	delete (url, options, acceptType) {
		return request('delete', url, options, acceptType);
	},
	patch (url, options, acceptType) {
		return request('patch', url, options, acceptType);
	},
	axios
}

export default xhr
