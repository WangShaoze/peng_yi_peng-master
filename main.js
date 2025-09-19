import App from './App'
// import "@/static/tailwind.css"

import * as Pinia from 'pinia';
import { http } from "@/util/request"

import { requestInterceptor } from "@/util/request_interceptor"
requestInterceptor()

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.config.globalProperties.$http = http
  app.use(Pinia.createPinia());
  return {
    app,
    Pinia,
  }
}
// #endif