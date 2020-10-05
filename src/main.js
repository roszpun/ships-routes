import Vue from 'vue';
import papaparse from 'papaparse';
import 'vue-googlemaps/dist/vue-googlemaps.css';
import VueGoogleMaps from 'vue-googlemaps';
import App from './App.vue';

Vue.config.productionTip = false;
Vue.prototype.$parser = papaparse;
Vue.use(VueGoogleMaps, {
  load: {
    apiKey: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
    useBetaRenderer: false,
  },
});
new Vue({
  render: (h) => h(App),
}).$mount('#app');
