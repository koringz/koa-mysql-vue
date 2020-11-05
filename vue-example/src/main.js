import 'babel-polyfill'
import Vue from 'vue'
import router from './router'
import App from './App.vue'
import element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'


import api from './api/index.js'

import 'assets/css/reset.css'
import 'assets/css/common.css'

import '@/components/Kmsjsmind/kmsjsmap.css'
import '@/components/Kmsjsmind/kmsjsmap.js'

Vue.config.productionTip = false
Vue.prototype.$api = api

Vue.use(element)

new Vue({
  render: h => h(App),
  router
}).$mount('#app')