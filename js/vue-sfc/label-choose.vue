<template lang="pug">
  #LabelChoose-wrapper
    #answers
      div.label-answer(
        v-for="(label, i) in content.labels",
        v-html="label",
        :class="renderLabelClasses(i)",
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
  
  // import Anime from "animejs"
  
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
          outer: [],
          inner: [],
          river: {
            back: null,
            front: null,
          }
        },
        dX: Config.river.width / Config.elements.count
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
        return $(document.createElement('div'));
      },
      
      $element($el) {
        return $el.find('div');
      },
  
      $wrap(index) {
        return $(`.wrap[data-index=${index}]`);
      },
      
      getQuestionEl() {
        return document.querySelector(`#${this.id.question}`);
      },
      
      getHTMLObject($el) {
        return $el[0];
      },
      
      renderQuestion() {
        $(`#${this.id._wrapper}`).append(
          this.$div()
            .attr('id', this.id.question)
            .html(this.content.items[this.sequence[this.answer.step]])
            .css({
              opacity: 1
            })
        )
      },
      
      renderLabelClasses(i) {
        return {
          wrong: this.highlight.wrong && i === this.answer.index,
          correct: this.highlight.correct && i === this.answer.index
        }
      },
      
      elementSelector($el) {
        return `.wrap:nth-child(${$el.data('index') + 1}) > div`;
      },
      
      elementWrapSelector($el) {
        return `.wrap:nth-child(${$el.data('index') + 1})`;
      },
      
      placeElement($el, ops) {
        $el.css(ops);
      },
      
      randomizeClass() {
        return this.classes.elements[this.randomize(this.classes.elements.length)];
      },
      
      randomize(max) {
        // window.randomize = this.randomize;
        return Math.round((Math.random() * max * 1e2) % max);
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
      
      currentAnswerElements(i) {
        let $elements;
        switch (i) {
          case 0: $elements = $('#river-back, #river-front, #river-static'); break;
          case 1: $elements = $('.tr1, .tr2'); break;
          case 2: $elements = $('.l1, .l2, .l3'); break;
          case 3: $elements = $('.e1, .e2, .e3'); break;
        }
        return $elements;
      },
      
      pauseElementAnimation(index) {
        this.elements.outer[index].pause();
        this.elements.inner[index].pause();
      },
  
      playElementAnimation(index) {
        this.elements.outer[index].play();
        this.elements.inner[index].play();
      },
      
      applyWrapAnimation($el, offsetFromStart) {
        let offsetToEnd = this.config.river.width - offsetFromStart;
        
        let durationToEnd = this.config.elements.T * (offsetToEnd / this.config.river.width);
        let durationFromStart = this.config.elements.T * (offsetFromStart / this.config.river.width);
        
        return anime({
          loop: true,
          easing: "linear",
          targets: this.getHTMLObject($el),
          duration: this.config.elements.T,
          autoplay: false,
          direction: "normal",
          left: [
            { value: this.config.river.width, duration: durationToEnd },
            { value: 0, duration: 0 },
            { value: offsetFromStart, duration: durationFromStart }
          ],
        });
      },
  
      applyElementAnimation($el) {
        return anime({
          loop: true,
          targets: this.getHTMLObject($el),
          easing: "easeInOutSine",
          autoplay: false,
          direction: "alternate",
          // TODO: Remove constant (20)
          duration: this.config.elements.T / (10 + this.randomize(20)),
          translateY: this.config.elements.oscillationOffset
        });
      },
      
      /**
       * Animation renders
       */
      
      pauseRiverAnimation() {
        this.elements.river.back.pause();
        this.elements.river.front.pause();
      },
      
      playRiverAnimation() {
        this.elements.river.back.play();
        this.elements.river.front.play();
      },
      
      animateRiver() {
        // TODO: remove constant (0.8)
        this.elements.river.front = anime({
          targets: `#${this.id.river.front}`,
          easing: "linear", loop: true, duration: this.config.elements.T * 0.8,
          backgroundPositionX: "1645px",
        });
  
        this.elements.river.back = anime({
          targets: `#${this.id.river.back}`,
          easing: "linear", loop: true, duration: this.config.elements.T,
          backgroundPositionX: "1645px",
        });
      },
      
      animateRiverElements() {
        let $upper, $lower;
        let upperElAnim, upperElWrapAnim,
            lowerElAnim, lowerElWrapAnim;
        let offsetFromStart;
        
        for (let i = 0; i < this.config.elements.count; i++) {
          // $upper = this.renderElement({ index: i * 2, class:  this.randomizeClass()});
          // $lower = this.renderElement({ index: i * 2 + 1, class: this.randomizeClass()});
          offsetFromStart = this.countLeftOffset(i);
          if (i % 2) {
            $lower = this.$wrap(i);
            this.placeElement($lower, {
              bottom: this.countLowerOffset(),
              left: offsetFromStart
            });
            lowerElWrapAnim = this.applyWrapAnimation($lower, offsetFromStart);
            lowerElAnim = this.applyElementAnimation(this.$element($lower));
      
            this.elements.outer.push( lowerElWrapAnim );
            this.elements.inner.push( lowerElAnim );
          } else {
            $upper = this.$wrap(i);
            this.placeElement($upper, {
              bottom: this.countUpperOffset(),
              left: offsetFromStart
            });
            upperElWrapAnim = this.applyWrapAnimation($upper, offsetFromStart);
            upperElAnim = this.applyElementAnimation(this.$element($upper));
      
            this.elements.outer.push( upperElWrapAnim, );
            this.elements.inner.push( upperElAnim, );
          }
          this.playElementAnimation(i);
        }
      },
      
      distanceFromMiddle(el, middlePoint) {
        return $(el).parent().position().left - middlePoint;
      },
      
      getElementIndex($el) {
        // TODO: remove string constant
        return $el.data('index');
      },
      
      // TODO: refactor this function
      catchQuestionAndWashItAway(i) {
        this.animating = true;
        
        let _this = this;
        let middlePoint = this.config.river.width / 2;
        // TODO: remove constant (width of cropped workfield)...
        let allowedRange = 892 / 2;
        let $first, $second, firstIndex, secondIndex;
        let leftOffset = this.config.river.width / 2
          - allowedRange
          + this.config.elements.catch.place.left;
        let topOffset = this.config.elements.catch.place.top;
  
        anime({
          loop: false,
          autoplay: true,
          duration: 700,
          targets: this.getQuestionEl(),
          left: [{ value: leftOffset, easing: "easeOutSine" }],
          top: [{ value: topOffset, easing: "easeInSine" }],
        });
        
        if (i) {
          let $elements = this.currentAnswerElements(i);
          $elements.each((i, el) => {
            if (this.distanceFromMiddle(el, middlePoint) < allowedRange) {
              if (!$first) {
                $first = $(el).parent().css({zIndex: 60});
                firstIndex = this.getElementIndex($first);
                return true
              }
              if (!$second) {
                $second = $(el).parent().css({zIndex: 60});
                secondIndex = this.getElementIndex($second);
                return false
              }
            }
          });
    
          // Catch question
          let $question = $(this.getQuestionEl());
          let secondOffsetX = $question.width() + leftOffset - this.config.elements.catch.offset;
          let secondOffsetY = $question.height() + topOffset - this.config.elements.catch.offset;
          let firstOffsetX = leftOffset - this.config.elements.catch.offset;
          let firstOffsetY = $question.height() + topOffset - this.config.elements.catch.offset;
  
          this.pauseElementAnimation(firstIndex);
          this.pauseElementAnimation(secondIndex);
          
          anime({
              loop: false,
              autoplay: false,
              top: [{value: firstOffsetY, easing: "easeOutSine"}],
              left: [{value: firstOffsetX, easing: "easeInSine"}],
              targets: $first[0],
              duration: 700,
            }).play();
          anime({
              loop: false,
              autoplay: false,
              duration: 700,
              top: [{value: secondOffsetY, easing: "easeOutSine"}],
              left: [{value: secondOffsetX, easing: "easeInSine"}],
              targets: $second[0],
            }).play();
            
          setTimeout(() => {
            $(this.getQuestionEl())
              .append($first.removeAttr('style'))
              .append($second.removeAttr('style'));
          }, 700)
        } else {
        }
        
        // Wash away
        
        anime({
          loop: false,
          targets: this.getQuestionEl(),
          autoplay: false,
          opacity: [
            { value: 1, duration: 2000 },
            { value: 0, duration: 700, easing: "linear" }
          ],
    
          left: [
            {value: leftOffset, duration: 700, easing: "easeOutSine" },
            {value: '+=1000px', duration: 2000, easing: "easeInCubic"}
          ],
    
          top: [
            {value: topOffset, duration: 700, easing: "easeInSine" },
            {value: '+=30px', duration: 2000, easing: 'easeInCubic'}
          ],
    
          rotate: [
            {value: '10deg', duration: 300, delay: 100, easing: "linear"},
            {value: '0deg', duration: 400, easing: "linear"},
            {value: '4deg', duration: 500, delay: 200, easing: "linear"},
            {value: '-2deg', duration: 600, easing: "linear"},
            {value: '1deg', duration: 600, easing: "linear"},
          ],
    
          complete: () => {
            this.animating = false;
            $(this.getQuestionEl()).remove();
            this.answer.step++;
            this.renderQuestion();
            this.highlight.correct = false;
          }
        }).play();
      },
  
      /**
       * State control
       */
      
      turnHighlightOn(i) {
        this.currentAnswerElements(i).addClass('hover');
      },
  
      turnHighlightOff(i) {
        this.currentAnswerElements(i).removeClass('hover');
      },
      
      correctAnswerIndex() {
        return this.content.correct.indexOf(this.sequence[this.answer.step]);
      },
      
      pauseAllAnimations() {
        this.pauseRiverAnimation();
        for (let i = 0; i < this.config.elements.count; i++) {
          this.pauseElementAnimation(i);
        }
      },
  
      playAllAnimations() {
        this.playRiverAnimation();
        for (let i = 0; i < this.config.elements.count; i++) {
          this.playElementAnimation(i);
        }
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
            if (
              this.elements.inner.length === this.config.elements.count &&
              this.elements.inner.length === this.config.elements.count
            )
              this.playAllAnimations();
            else
              this.animateRiver();
              this.animateRiverElements();
            break;
          default:
            this.pauseAllAnimations();
        }
      },
      
      onRecieveData(payload) {
        this.sequence = payload;
        this.renderQuestion();
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
          this.catchQuestionAndWashItAway(labelIndex);
        } else {
          this.highlight.wrong = true;
        }
      }
    },
    watch: {
      'highlight.wrong': function(newV) {
        if (newV) {
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