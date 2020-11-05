import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

const rt = [
  { 
    path: '/login',
    name: 'login',
    component:  () => import('pages/Login/index.vue')
  },
  { 
    path: '/home',
    name: 'home',
    redirect: '/search',
    component:  () => import('pages/Home/index.vue'),
    children: [
      { 
        path: '/search',
        name: 'search',
        component:  () => import('pages/Search/index.vue')
      },
      { 
        path: '/grid',
        name: 'grid',
        component:  () => import('pages/Grid/index.vue')
      },
      { 
        path: '/usertable',
        name: 'usertable',
        component:  () => import('pages/UserTable/index.vue')
      },
      { 
        path: '/viewimage',
        name: 'viewimage',
        component:  () => import('pages/ViewImage/index.vue')
      },
      { 
        path: '/managemessage',
        name: 'managemessage',
        component:  () => import('pages/ManageMessage/index.vue')
      },
      { 
        path: '/addshopping',
        name: 'addshopping',
        component:  () => import('pages/AddShopping/index.vue')
      },
      { 
        path: '/modifiespassword',
        name: 'modifiespassword',
        component:  () => import('pages/ModifiesPassword/index.vue')
      },
      { 
        path: '/findpassword',
        name: 'findpassword',
        component:  () => import('pages/FindPassword/index.vue')
      },
      { 
        path: '/uploadfile',
        name: 'uploadfile',
        component:  () => import('pages/UploadFile/index.vue')
      },
      { 
        path: '/clip',
        name: 'clip',
        component:  () => import('pages/Clip/index.vue')
      },
      { 
        path: '/CityMap',
        name: 'citymap',
        component:  () => import('pages/CityMap/index.vue')
      },
      { 
        path: '/antv',
        name: 'antv',
        component:  () => import('pages/Antv/index.vue')
      },
      { 
        path: '/jsmind',
        name: 'jsmind',
        component:  () => import('pages/Jsmind/index.vue')
      },
    ]
  },
]

export default new Router({
  mode: 'history',
  routes: rt
})
