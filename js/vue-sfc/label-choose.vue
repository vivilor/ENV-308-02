<template lang="pug">
  #LabelChoose-wrapper
    #answers
      div.label-answer(
        v-for="(label, i) in content.labels",
        v-html="label",
        :class="setLabelClasses(i)",
        :data-labelindex="i",
        @click="onLabelClick(i)",
        @mouseleave="onLabelMouseLeave(i)",
        @mouseenter="onLabelMouseEnter(i)",
      )
    #river-static(:style="'width: ' + this.config.river.width + 'px'")
    #river-front(:style="'width: ' + this.config.river.width + 'px'")
    #river-back(:style="'width: ' + this.config.river.width + 'px'")
    .wrap(
      v-for="j in config.elements.count",
      :data-index="j-1"
    )
      div(:class="classes.elements[(j-1) % 8]")
    
</template>

<script>
  import VueEvents from "../events"
  import Config from "./config.json"
  
  import Anime from "animejs"
  
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
        
        id: {
          _wrapper: "LabelChoose-wrapper",
          question: "question",
          river: {
            back: "river-back",
            front: "river-front",
            static: "river-static",
          },
        },
        
        classes: {
          wrap: "wrap",
          hover: "hover",
          elements: ['e1', 'l1', 'tr2', 'l2', 'e3', 'tr1', 'l3','e2']
        },
        
        elements: {
          $river: {
            back: null,
            front: null,
          }
        },
        dX: Config.river.width / Config.elements.count
      }
    },
    mounted() {
      this.handleEvents();
      this.cacheData();
    },
    methods: {
      /** Utilties ***********************************************************/

      randomize(max) {
        // window.randomize = this.randomize;
        return Math.round((Math.random() * max * 1e2) % max);
      },
      
      cacheData() {
        console.log(this);
        this.elements.$river.back = $(`#${this.id.river.back}`);
        this.elements.$river.front = $(`#${this.id.river.front}`);
      },
      
      /** DOM-render functions ***********************************************/

      $renderDiv() {
        return $(document.createElement('div'));
      },
  
      $renderQuestion() {
        return this.$renderDiv()
          .attr('id', this.id.question)
          .html(this.currentQuestionText())
          .css({ opacity: 1 });
      },
      
      /** jQuery DOM getters *************************************************/
      
      $elementsByType(index) {
        let $elements;
        switch (index) {
          case 0: $elements = $('#river-back, #river-front, #river-static'); break;
          case 1: $elements = $('.tr1, .tr2'); break;
          case 2: $elements = $('.l1, .l2, .l3'); break;
          case 3: $elements = $('.e1, .e2, .e3'); break;
        }
        return $elements;
      },
      
      $elementsAll() {
        return $(`.${this.classes.elements.join(',')}`);
      },
      
      $element(index) {
        return this.$wrap(index).find('div');
      },
  
      $wrap(index) {
        return $(`.wrap[data-index=${index}]`);
      },
      
      $wraps() {
        return $(`.${this.classes.wrap}`);
      },
  
      $question() {
        return $(`#${this.id.question}`);
      },
      
      /** DOM, content and style control *************************************/
      
      currentQuestionText() {
        return this.content.items[this.sequence[this.answer.step]]
      },
      
      raw($el) {
        return $el[0];
      },
  
      setLabelClasses(i) {
        return {
          wrong: this.highlight.wrong && i === this.answer.index,
          correct: this.highlight.correct && i === this.answer.index
        }
      },
      
      placeQuestion() {
        this.$wrapper().append(this.$renderQuestion());
      },
      
      placeElement($el, ops) {
        $el.css(ops);
      },
      
      randomizeClass() {
        return this.classes.elements[this.randomize(this.classes.elements.length)];
      },
      
      countLeftOffset(i) {
        return this.dX * i + this.randomize(this.dX * this.config.elements.offsetRatio);
      },
      
      countUpperOffset() {
        return this.config.elements.offset.upper +
          this.randomize(this.config.elements.space.upper);
      },
  
      countLowerOffset() {
        return this.config.elements.offset.lower +
          this.randomize(this.config.elements.space.lower);
      },
      
      stopElementAnimation(index) {
        this.elements.outer[index].pause();
        this.elements.inner[index].pause();
      },
      
      applyWrapAnimation($el, offsetFromStart) {
        // let offsetToEnd = this.config.river.width - offsetFromStart;
        //
        // let durationToEnd = this.config.elements.T * (offsetToEnd / this.config.river.width);
        // let durationFromStart = this.config.elements.T * (offsetFromStart / this.config.river.width);
      },
      
      applyElementAnimation($el) {
        //   duration: this.config.elements.T / (10 + this.randomize(20)),
        // });
      },
      
      /** Animation renders **************************************************/
      
      /** River animation ****************************************************/

      animateRiverBack() {
        this.elements.$river.back
          .css({ backgroundPositionX: 0 })
          .animate(
            { backgroundPositionX: 1645 },
            this.config.elements.T,
            "linear",
            this.animateRiverBack
          );
      },
  
      animateRiverFront() {
        // TODO: Remove constants
        this.elements.$river.front
          .css({ backgroundPositionX: 0 })
          .animate(
            { backgroundPositionX: 1645 },
            this.config.elements.T * 0.8,
            "linear",
            this.animateRiverFront
          );
      },
      
      
      stopRiverAnimation() {
        this.elements.$river.back.stop();
        this.elements.$river.front.stop();
      },
      
      playRiverAnimation() {
        this.animateRiverBack();
        this.animateRiverFront();
      },
      
      /**
       * River elements animation
       */
      
      animateElementFromStart($el) {
        let _this = this;
        $el
          .css({ left: 0 })
          .animate(
            { left: this.config.river.width },
            this.config.elements.T,
            "linear",
            function() {
              _this.animateElementFromStart($(this));
            }
          );
      },
      
      animateElementFirstMovingToEnd($el, offsetFromStart) {
        let _this = this;
        let distanseToEnd = this.config.river.width - offsetFromStart;
        let durationToEnd = this.config.elements.T * (distanseToEnd / this.config.river.width);
        
        $el.animate(
          { left: `+=${distanseToEnd}` },
          durationToEnd,
          "linear",
          function() {
            _this.animateElementFromStart($(this));
          }
        )
      },
      
      animateRiverElements() {
        let $upper, $lower;
        let offsetFromStart;
        
        for (let i = 0; i < this.config.elements.count; i++) {
          offsetFromStart = this.countLeftOffset(i);
          
          if (i % 2) {
            $lower = this.$wrap(i);
            this.placeElement($lower, {
              bottom: this.countLowerOffset(),
              left: offsetFromStart
            });
            this.animateElementFirstMovingToEnd($lower, offsetFromStart);
      
          } else {
            $upper = this.$wrap(i);
            this.placeElement($upper, {
              bottom: this.countUpperOffset(),
              left: offsetFromStart
            });
            this.animateElementFirstMovingToEnd($upper, offsetFromStart);
          }
        }
      },
      
      distanceFromMiddle(el, middlePoint) {
        return $(el).parent().position().left - middlePoint;
      },
      
      getElementIndex($el) {
        // TODO: remove string constant
        return $el.data('index');
      },
      
      /**
       * Catch and wash away animation
       */
      
      catchElement($el) {
        $(this.$question()).append($el.removeAttr('style'))
      },
      
      animeObjDropQuestion(leftOffset, topOffset) {
        return {
          loop: false,
          targets: `#${this.id.question}`,
          autoplay: true,
          delay: 0,
          translateX: [
            { value: `+=${leftOffset}`,  duration: 5000, easing: "easeOutSine", elastisity: 100 }
          ],
          translateY: [
            { value: `+=${topOffset}`, duration: 5000, easing: "easeInCubic", elastisity: 100 }
          ],
          rotate: [
            { value: -50, duration: 1400, delay: 100, easing: "linear", elastisity: 100 },
            { value: 0, duration: 3500, easing: "linear", elastisity: 100 },
          ],
          begin: () => console.log('Animation starts'),
          complete: () => console.log('Animation finished'),
        }
      },
      
      animeTimelineCatchAndWashAway($first, $second) {
        return {
          loop: false,
          direction: "normal",
          autoplay: true,
          complete: () => {
            if ($first && $second) {
              this.catchElement($first);
              this.catchElement($second);
            }
            anime(this.animeObjWashAway());
          }
        }
      },
      
      // TODO: Remove constants!!!
      animeObjWashAway() {
        return {
          loop: false,
          targets: this.$question(),
          autoplay: true,
          direction: "normal",
          opacity: [
            { value: 1, duration: 1600 },
            { value: 0, duration: 400, easing: "easeInSine" }
          ],
    
          left: [
            //{value: leftOffset, duration: 700, easing: "easeOutSine" },
            {value: '+=1000px', duration: 2000, easing: "easeInCubic"}
          ],
    
          top: [
            //{value: topOffset, duration: 700, easing: "easeInSine" },
            {value: '+=30px', duration: 2000, easing: 'easeInCubic'}
          ],
    
          rotate: [
            //{value: '10deg', duration: 300, delay: 100, easing: "linear"},
            //{value: '0deg', duration: 400, easing: "linear"},
            {value: '4deg', duration: 500, delay: 200, easing: "linear"},
            {value: '-2deg', duration: 800, easing: "linear"},
            {value: '1deg', duration: 800, easing: "linear"},
          ],
    
          complete: () => {
            this.animating = false;
            $(this.$question()).remove();
            this.answer.step++;
            this.$renderQuestion();
            this.highlight.correct = false;
          }
        }
      },
      
      animeObjCatchElement($el, offsetX, offsetY) {
        return {
          top: [{value: offsetY, easing: "easeOutSine"}],
          left: [{value: offsetX, easing: "easeInSine"}],
          offset: 0,
          targets: $el[0],
          duration: 700,
        }
      },
      
      /**
       * Animation control
       */
      
      stopAllAnimations() {
        this.stopRiverAnimation();
        // *TODO: Add stop for all elements
      },
  
      playAllAnimations() {
        this.playRiverAnimation();
        // *TODO: Add play for all elements
      },
      
      // TODO: refactor this function
      catchQuestionAndWashItAway(labelIndex) {
        anime(this.animeObjDropQuestion(300, 200));
        // anime
        //   .timeline(this.animeTimelineCatchAndWashAway())
        //   .add(this.animeObjDropQuestion(1700, 300));
        // this.animating = true;
        //
        // let _this = this;
        // let middlePoint = this.config.river.width / 2;
        // // TODO: remove constant (width of cropped workfield)...
        // let allowedRange = 892 / 2;
        // let $first, $second, firstIndex, secondIndex;
        // let leftOffset = this.config.river.width / 2
        //   - allowedRange
        //   + this.config.elements.catch.place.left;
        // let topOffset = this.config.elements.catch.place.top;
        //
        // if (labelIndex) {
        //   let $elements = this.currentAnswerElements(labelIndex);
        //   $elements.each((i, el) => {
        //     if (this.distanceFromMiddle(el, middlePoint) < allowedRange) {
        //       if (!$first) {
        //         $first = $(el).parent().css({zIndex: 60});
        //         firstIndex = this.getElementIndex($first);
        //         return true
        //       }
        //       if (!$second) {
        //         $second = $(el).parent().css({zIndex: 60});
        //         secondIndex = this.getElementIndex($second);
        //         return false
        //       }
        //     }
        //   });
        //
        //   // Catch question
        //   let $question = $(this.$question());
        //   let secondOffsetX = $question.width() + leftOffset - this.config.elements.catch.offset;
        //   let secondOffsetY = $question.height() + topOffset - this.config.elements.catch.offset;
        //   let firstOffsetX = leftOffset - this.config.elements.catch.offset;
        //   let firstOffsetY = $question.height() + topOffset - this.config.elements.catch.offset;
        //
        //   this.pauseElementAnimation(firstIndex);
        //   this.pauseElementAnimation(secondIndex);
        //
        //   anime
        //     .timeline(this.animeTimelineCatchAndWashAway($first, $second))
        //     // .add(this.animeObjCatchElement($first, firstOffsetX, firstOffsetY))
        //     // .add(this.animeObjCatchElement($second, secondOffsetX, secondOffsetY))
        //     .add(this.animeObjDropQuestion(leftOffset, topOffset));
        // } else {
        //   anime
        //     .timeline(this.animeTimelineCatchAndWashAway())
        //     .add(this.animeObjDropQuestion(leftOffset, topOffset));
        // }
        
      },
  
      /**
       * State control
       */
      
      turnHighlightOn(i) {
        this.$elementsByType(i).addClass('hover');
      },
  
      turnHighlightOff(i) {
        this.$elementsByType(i).removeClass('hover');
      },
      
      correctAnswerIndex() {
        return this.content.correct.indexOf(this.sequence[this.answer.step]);
      },
  
      /**
       * Event handlers
       */
      
      handleEvents() {
        this.eventBus.$on(VueEvents.step.parseData, this.onRecieveData);
        this.eventBus.$on(VueEvents.step.change, this.onStepChange);
      },

      onStepChange(stepIndex) {
        switch (stepIndex) {
          case 2:
            this.playRiverAnimation();
            this.animateRiverElements();
            break;
          default:
            this.pauseAllAnimations();
            break;
        }
      },
      
      onRecieveData(payload) {
        this.sequence = payload;
        this.$renderQuestion();
      },
      
      onLabelMouseEnter(labelIndex) {
        this.turnHighlightOn(labelIndex);
      },
  
      onLabelMouseLeave(labelIndex) {
        this.turnHighlightOff(labelIndex);
      },
      
      onLabelClick(labelIndex) {
        if (this.animating)
          return;
        this.answer.index = labelIndex;
        if (labelIndex === this.correctAnswerIndex()) {
          this.highlight.correct = true;
          // this.catchQuestionAndWashItAway(labelIndex);
        } else {
          this.highlight.wrong = true;
        }
      }
    },
    watch: {
      'highlight.wrong': function(newValue) {
        if (newValue) {
          setTimeout(
            () => this.highlight.wrong = false,
            this.config.highlightWrongTimeout
          );
        }
      }
    }
  }
</script>

<style lang="scss">
  @import "~themes/custom.scss";
  @import "~fonts/ConquerorSans/ConquerorSans.css";
  .tr1 {
    background-image: url(../../img/river/tr1.svg);
    width: 64px;
    height: 50px;
    &.hover { background-image: url(../../img/river/tr1-hover.svg); }
  }
  .tr2 {
    background-image: url(../../img/river/tr2.svg);
    width: 44px;
    height: 50px;
    &.hover { background-image: url(../../img/river/tr2-hover.svg); }
  }
  .e1 {
    background-image: url(../../img/river/e1.svg);
    width: 90px;
    height: 49px;
    &.hover { background-image: url(../../img/river/e1-hover.svg); }
  }
  .e2 {
    background-image: url(../../img/river/e2.svg);
    width: 90px;
    height: 49px;
    &.hover { background-image: url(../../img/river/e2_3-hover.svg); }
  }
  .e3 {
    background-image: url(../../img/river/e3.svg);
    width: 90px;
    height: 49px;
    &.hover { background-image: url(../../img/river/e2_3-hover.svg); }
  }
  .l1 {
    background-image: url(../../img/river/l1.svg);
    width: 81px;
    height: 82px;
    &.hover { background-image: url(../../img/river/l1-hover.svg); }
  }
  .l2 {
    background-image: url(../../img/river/l2.svg);
    width: 82px;
    height: 81px;
    &.hover { background-image: url(../../img/river/l2-hover.svg); }
  }
  .l3 {
    background-image: url(../../img/river/l3.svg);
    width: 77px;
    height: 76px;
    &.hover { background-image: url(../../img/river/l3-hover.svg); }
  }

  div.wrap {
    position: absolute;
    z-index: 30;
  }
  
  #question {
    position: absolute;
    border: 1px solid #f0f0f0;
    display: inline-block;
    opacity: 0;
    transition: .5s linear .1s;
    line-height: 34px;
    padding: 0 16px;
    font-size: 23px;
    color: black;
    font-family: "ConquerorSans", sans-serif;
    z-index: 50;
    left: ($river-width - $workfield-cropped) / 2;
    background-color: white;
    
  
    & > div:first-child {
      position: absolute;
      bottom: 20px;
      left: -30px;
    }
  
    & > div:last-child {
      position: absolute;
      bottom: 30px;
      right: 30px;
    }
  }
  
</style>

<style lang="scss" scoped>
  @import "~themes/custom.scss";
  
  #river-static, #river-front, #river-back {
    position: absolute;
    width: 100%;
  }
  
  #river-back {
    background-image: url(../../img/river/wave-back.svg);
    height: 108px;
    bottom: 150px;
    z-index: 4;
    &.hover {
      background-image: url(../../img/river/wave-back-hover.svg);
    }
  }
  
  #river-front {
    background-image: url(../../img/river/wave-front.svg);
    height: 105px;
    bottom: 150px;
    z-index: 5;
    &.hover {
      background-image: url(../../img/river/wave-front-hover.svg);
    }
  }
  
  #river-static {
    height: $river-overflow + $river-height;
    bottom: -$river-overflow;
    position: absolute;
    background-color: #faecd7;
    z-index: 5;
    &.hover {
      background-color: #fff4bf;
    }
  }
  
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
  // TODO: change constant values
  div#LabelChoose-wrapper {
    top: 68px;
    left: $workfield-cropped / 2 - $river-width / 2;
    right: 0;
    width: $river-width;
    bottom: 0;
    position: absolute;
    
    & > #answers {
      top: 128px;
      left: $river-width / 2 - $workfield-cropped / 2;
      width: 676px;
      display: flex;
      position: relative;
      justify-content: space-between;
      
    }
  }
  
</style>