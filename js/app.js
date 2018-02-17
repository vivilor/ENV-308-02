import Vue from "vue"
import LabelDrag from "vue-sfc/label-drag.vue"
import AppWorkfield from "vue-sfc/app-workfield.vue"

import Content from "locale/ru-ru.json"

window.anime = require('animejs');
window.$ = require('jquery');
require('webpack-jquery-ui/draggable');
require('webpack-jquery-ui/droppable');

let app = new Vue({
  el: "#app",
  
  data() {
    return {
      content: Content,
      eventBus: new Vue()
    }
  },
  
  components: {
    LabelDrag,
    AppWorkfield
  }
});
