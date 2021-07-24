import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/phoneReset.css'
import * as apis from './utils/apis'
import * as tool from './utils/tools'
import { Calendar, Icon, RadioGroup, Radio, Skeleton, Empty } from 'vant'

Vue.config.productionTip = false
Vue.prototype.$apis = apis;
Vue.prototype.$utils = tool;
Vue.use(Calendar)
Vue.use(Skeleton).use(Empty)
Vue.use(Icon).use(RadioGroup).use(Radio)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
