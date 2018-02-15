<template lang="pug">
  #LabelChoose-wrapper
    #answers
      div.label-answer(
        v-for="(label, i) in content.labels",
        v-html="label",
        :class="renderLabelClasses()",
        :data-labelindex="i",
        @click="onLabelClick(i)",
        @mouseleave="onLabelMouseLeave(i)",
        @mouseenter="onLabelMouseEnter(i)",
      )
    #river-static(:style="{ width: this.config.river.width }")
    #river-front(:style="{ width: this.config.river.width }")
    #river-back(:style="{ width: this.config.river.width }")
    
</template>

<script>
  import Anime from "../anime"
  import VueEvents from "../events"
  
  import Config from "./config.json"
  
  export default {
    name: "label-choose",
    props: {
      content: {
        type: Object,
        required: true
      },
      eventBus: {
        type: Object,
        required: true
      }
    },
    
    data() {
      return {
        config: Config,
        
        answer: {
          step: 0,
          index: 0,
        },
        
        highlight: {
          correct: false,
          wrong: false
        },
        animating: false,
        sequence: null,
        classes: {
          wrap: "wrap",
          elements: ['e1', 'e2', 'e3', 'l1', 'l2', 'l3', 'tr1', 'tr2']
        },
        
      }
    },
    mounted() {
      this.handleEvents();
    },
    methods: {
      /**
       * DOM-manuipulations
       */

      $div() {
        this.$(document.createElement('div'));
      },
      
      renderLabelClasses() {
        return {
          wrong: this.highlight.wrong && i === this.answer.index,
          correct: this.highlight.correct && i === this.answer.index
        }
      },
      
      cacheValues () {
      
      },
      
      renderElement(ops) {
        let $ret = this.$div();
        // Inner element
        $ret.data('index', ops.index);
        $ret.addClass(ops.class);
        // Outer element
        $ret = this.$div().append($ret);
        $ret.addClass(this.classes.wrap);
        $ret.data('index', ops.index);
        return $ret;
      },
      
      countPos() {
      
      },
      
      renderRiverElements() {
        for (let i = 0; i < this.config.elements.count; i++) {
          this.renderElement({
          
          })
        }
      },
      
      /**
       * Animation renders
       */
  
      catchQuestionAndWashItAway() {
      
      },
  
      /**
       * State control
       */
      
      correctAnswerIndex() {
        return this.content.correct[this.sequence[this.answer.step]];
      },
      
  
      /**
       * Event handlers
       */
      
      handleEvents() {
        this.eventBus.$on(VueEvents.step.parseData, this.onRecieveData)
      },

      onRecieveData(payload) {
        console.log(payload);
        this.sequence = payload;
      },
      
      onLabelMouseEnter(labelIndex) {
      
      },
  
      onLabelMouseLeave(labelIndex) {
      
      },
      
      onLabelClick(labelIndex) {
        if (this.animating)
          return;
        this.answer.index = labelIndex;
        if (labelIndex === this.correctAnswerIndex()) {
          this.highlightCorrect = true;
          this.catchQuestionAndWashItAway();
        } else {
          this.highlightLabelAsWrong = true;
        }
      }
    },
    watch: {
      highlightLabelAsWrong: function(newV) {
        if (newV) {
          setTimeout(
            () => this.highlightLabelAsWrong = false,
            this.config.highlightWrongTimeout
          );
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  
  div.label-answer {
    color: #00a095;
    cursor: pointer;
    border: #86d1cc 1px solid;
    font-size: 23px;
    line-height: 35px;
    border-radius: 3px;
    text-align: center;
    font-family: ConquerorSans, sans-serif;
    border-bottom: #00a095 2px solid;
  
    &:first-child {
      width: 110px;
    }
    &:not(:first-child) {
      width: 160px;
    }
  
    &:hover {
      border-color: #daf1ef;
      border-bottom-color: #ffe66c;
    }
  
    &:active {
      border: 2px solid #00a095;
      margin: -1px -1px 0 -1px;
    }
  
    &.wrong {
      border: 2px solid #f48154;
      margin: -1px -1px 0 -1px;
    }
    
    &.correct {
      border: 2px solid #13ebdc;
      margin: -1px -1px 0 -1px;
    }
  }
  
  div#LabelChoose-wrapper {
    top: 68px;
    left: 0;
    right: 0;
    width: 100%;
    bottom: 0;
    position: absolute;
    
    & > #answers {
      top: 128px;
      width: 676px;
      display: flex;
      position: relative;
      justify-content: space-between;
      
      
    }
  }
  #river-back {}
  
</style>