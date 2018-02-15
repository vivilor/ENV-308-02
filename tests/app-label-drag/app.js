import Vue from "vue"
import LabelDrag from "vue-sfc/label-drag.vue"

import Content from "locale/ru-ru.json"

window.$ = require('jquery');
require('webpack-jquery-ui');

let app = new Vue({
  el: "#app",
  
  data() {
    return {
      content: Content,
      eventBus: new Vue()
    }
  },
  
  components: {
    LabelDrag
  }
});
