<template lang="pug">
  #LabelDrag-wrapper
    #traps
      div(v-for="i in content.traps.count", :key="i")
        .index(v-text="i")
        .trap(
          :class="{ disabled: complete }",
          :data-trapindex="i-1"
        )
</template>

<script>
  
  import VueEvents from "../events"
  import Content from "locale/ru-ru.json"
  import Config from "../../config.json"

  // import $ from 'jquery'
  // import 'jquery-ui'
  
  export default {
    name: "label-drag",
    props: {
      eventBus: {
        type: Object,
        required: true
      },
      content: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        keys: {
          labelIndex: 'labelindex',
          trapIndex: 'trapindex'
        },
        classes: {
          _wrapper: "LabelDrag-wrapper",
          
          trap: 'trap',
          wrong: 'wrong',
          label: 'label',
          correct: 'correct',
          trapped: 'trapped',
          laberOverTrappedLabel: 'label-over-trapped-label'
        },
        trapped: Array(this.content.traps.count).fill(-1),
        complete: false,
        
        $pairSecondLabel: null
      }
    },
    
    mounted() {
      this.handleEvents();
      this.onReset(1);
    },
    
    methods: {
      disableButton() {
        this.eventBus.$emit(VueEvents.buttons.disable, Content.buttons.validateStep.name);
      },
      
      enableButton() {
        this.eventBus.$emit(VueEvents.buttons.enable, Content.buttons.validateStep.name);
      },
      
      handleEvents() {
        // TODO: Change string constant to variable
        this.eventBus.$on(VueEvents.validation.start, this.onValidate);
        this.eventBus.$on(VueEvents.step.reset, this.onReset);
        this.eventBus.$on(VueEvents.global.restart, this.onRestart);
      },
      
      $div() {
        return $(document.createElement('div'));
      },
  
      $label(labelIndex) {
        return $(`.${this.classes.label}[data-${this.keys.labelIndex}=${labelIndex}]`);
      },
  
      $trap(trapIndex) {
        return $(`.${this.classes.trap}[data-${this.keys.trapIndex}=${trapIndex}]`);
      },
      
      /**
       * Pair dispose functions
       */
      
      fixPosition(pos) {
        pos.left = Math.ceil(pos.left);
        return pos;
      },
      
      createPairSecondLabel(trapIndex) {
        let text = this.content.pair[1];
        let pos = this.fixPosition(this.$trap(trapIndex).position());
        
        this.$pairSecondLabel = this.createLabel(text, -1).hide();
        this.$wrapper().append(
          this.$pairSecondLabel
            .css(pos)
            .addClass(this.classes.correct)
        );
        this.$pairSecondLabel.draggable();
      },
      
      createPairFirstLabel() {
        this.label()
      },
  
      calcLabelHeight($label) {
        return $label.height() +
          parseInt($label.css('padding-top')) +
          parseInt($label.css('border-bottom')) +
          parseInt($label.css('padding-bottom'));
      },
  
      calcPathForGrowAnimaion() {
        let tallLabelHeight = this.calcLabelHeight(this.$pairSecondLabel);
        let smallLabelHeight = this.calcLabelHeight(this.$label(this.trapped[1]));
        console.log(tallLabelHeight);
        let heightShift =
          Config.labels[0].space +
          tallLabelHeight * 2 -
          smallLabelHeight;
        return {
          height: heightShift
        }
      },
  
      calcPathForOtherLabelsShiftAnimation() {
        let tallLabelHeight = this.calcLabelHeight(this.$pairSecondLabel);
        let smallLabelHeight = this.calcLabelHeight(this.$label(this.trapped[1]));
        let spaceBetweenLabels = (Config.labels[0].space - smallLabelHeight);
        let topShift =
          tallLabelHeight * 2 -
          smallLabelHeight +
          spaceBetweenLabels;
        return {
          top: `+=${topShift}`
        }
      },
      
      calcPathForPairShiftAnimation() {
        let tallLabelHeight = this.calcLabelHeight(this.$pairSecondLabel);
        let smallLagelHeight = this.calcLabelHeight(this.$label(this.trapped[1]));
        let topShift =
          tallLabelHeight +
          Config.labels[0].space -
          smallLagelHeight;
        return {
          top: `+=${topShift}`
        }
      },
  
      $trapNumber() {
        let trapIndex = this.trapped.indexOf(this.content.paired);
        return this.$trap(trapIndex).parent();
      },
  
      animateTrapNumberGrow() {
        this.$trapNumber().animate(
          this.calcPathForGrowAnimaion(),
          Config.animation.duration,
          Config.animation.easing,
        )
      },
  
      animateLabelShift($label, offsetObj) {
        $label.animate(
          offsetObj,
          Config.animation.duration,
          Config.animation.easing,
        );
      },
  
      disposePair() {
        let offsetObj;
        for (let i = 0; i < this.trapped.length; i++) {
          if (this.trapped[i] === this.content.paired) {
            this.createPairSecondLabel(i);
            offsetObj = this.calcPathForPairShiftAnimation();
            this.setLabelText(this.getTrappedLabel(i), this.content.pair[0]);
            this.animateLabelShift(this.$pairSecondLabel.show(), offsetObj);
            this.animateTrapNumberGrow(i);
            
            if (i < this.trapped.length - 1) {
              offsetObj = this.calcPathForOtherLabelsShiftAnimation();
              
              for (let j = i+1; j < this.trapped.length; j++)
                this.animateLabelShift(this.$label(this.trapped[j]), offsetObj);
            }
            break;
          }
        }
      },
      
      isNotCorrectLabel(labelIndex) {
        return this.content.traps.correct.indexOf(labelIndex) === -1;
      },
  
      isNotTrappedLabel(labelIndex) {
        return this.trapped.indexOf(labelIndex) === -1;
      },
      
      removeWrongLabels() {
        for (let i = 0; i < this.content.labels.length; i++) {
          if (this.isNotCorrectLabel(i)) {
            this.$label(i).remove();
          }
        }
      },
      
      disableDragAndDropFunctionality() {
        $(`.${this.classes.label}`).draggable('option', 'disabled', true);
        $(`.${this.classes.trap}`).droppable('option', 'disabled', true);
      },
      
      createLabel(text, i) {
        let $el = this.$div();
        this.setLabelIndex($el, i);
        this.setLabelText($el, text);
        $el.addClass(this.classes.label);
        return $el;
      },
      
      setLabelIndex($el, i) {
        $el.attr(`data-${this.keys.labelIndex}`, i);
      },
      
      setLabelText($el, text) {
        $el.html(text);
      },
      
      calcPathForTrapAnimation($trap, labelPos) {
        let trap = $trap.position();
        return {
          top: `+=${trap.top - labelPos.top}`,
          left: `+=${trap.left - labelPos.left}`
        }
      },
      
      calcOriginalLabelPosition(labelIndex) {
        console.log('hi');
        return {
          top: Config.labels[0].top + labelIndex * (Config.labels[0].space),
          left: Config.labels[0].left
        }
      },
      
      calcPathForReturnAnimation($label) {
        let labelIndex = this.getLabelIndex($label);
        let current = $label.position();
        let origin = this.calcOriginalLabelPosition(labelIndex);
        
        return {
          top: `+=${origin.top - current.top}`,
          left: `+=${origin.left - current.left}`
        }
      },
      
      getTrapIndex($el) {
        return $el.data(this.keys.trapIndex);
      },
      
      getLabelIndex($el) {
        return $el.data(this.keys.labelIndex);
      },
      
      $wrapper() {
        return $(`#${this.classes._wrapper}`);
      },
      
      placeLabel($el, labelIndex) {
        this.$wrapper().append(
          $el.css(
            this.calcOriginalLabelPosition(labelIndex)
          )
        );
        
      },
      
      renderLabels() {
        let $el = null;
        this.content.labels.forEach(
          (text, i) => {
            $el = this.createLabel(text, i);
            this.placeLabel($el, i);
          }
        );
      },
      
      hasLabel($trap) {
        return this.trapped[this.getTrapIndex($trap)] !== -1;
      },
      
      markAsTrapped(trapIndex, labelIndex) {
        this.$set(this.trapped, trapIndex, labelIndex);
      },
      
      removeTrappedMark(trapIndex) {
        this.$set(this.trapped, trapIndex, -1);
      },
      
      removeTrappedMarkFromLabel(labelIndex) {
        this.$set(this.trapped, this.trapped.indexOf(labelIndex), -1);
      },
      
      removeLabelFromPrevTrap(labelIndex) {
        let trapIndex = this.trapped.indexOf(labelIndex);
        if (trapIndex !== -1) {
          this.removeTrappedMark(trapIndex);
        }
      },
      
      trapLabel(ev, ui) {
        let $trap = $(ev.target);
        let $label = ui.draggable.addClass(this.classes.trapped);
        let labelPos = ui.position;
        let trapIndex = this.getTrapIndex($trap);
        let labelIndex = this.getLabelIndex($label);
        
        this.removeLabelFromPrevTrap(labelIndex);
        
        $label.animate(
          this.calcPathForTrapAnimation($trap, labelPos),
          Config.animation.duration,
          Config.animation.easing,
          this.markAsTrapped(trapIndex, labelIndex)
        );
      },
      
      returnLabel($label) {
        $label
          .removeClass(this.classes.trapped)
          .animate(
            this.calcPathForReturnAnimation($label),
            Config.animation.duration,
            Config.animation.easing,
            this.removeHighlight($label)
          );
      },
      
      
      enableShadowOnTrappedLabel($trap) {
        let $label = this.getTrappedLabel(this.getTrapIndex($trap));
        $label.addClass(this.classes.laberOverTrappedLabel);
      },
      
      disableShadowOnTrappedLabel($trap) {
        let $label = this.getTrappedLabel(this.getTrapIndex($trap));
        $label.removeClass(this.classes.laberOverTrappedLabel);
      },
      
      highlightWrong(labelIndex) {
        this.$label(labelIndex).addClass(this.classes.wrong);
      },
      
      highlightCorrect(labelIndex) {
        this.$label(labelIndex).addClass(this.classes.correct);
      },
      
      removeHighlight($label) {
        $label.removeClass(`${this.classes.wrong} ${this.classes.correct}`);
      },
      
      getTrappedLabel(trapIndex) {
        return this.$label(this.trapped[trapIndex]);
      },
      
  
      removeLabels() {
        $(`.${this.classes.label}`).remove();
        
        if (this.$pairSecondLabel)
          this.$pairSecondLabel.hide();
      },
      
      resetTrappedArray() {
        for (let i = 0; i < this.trapped.length; i++) {
          this.removeTrappedMark(i);
        }
      },
      
      shrinkLabelNumber() {
        $('#traps').find('> div').removeAttr('style');
      },
      
      /**
       * Drag and drop activation
       */
      
      makeLabelsDraggable() {
        let _this = this;
        $(`.${this.classes.label}`).draggable({
          zIndex: 1000,
          revert: function(droppable) {
            let labelIndex = _this.getLabelIndex(this);
            if (!droppable) {
              if (_this.isNotTrappedLabel(labelIndex)) {
                return true;
              } else {
                _this.removeTrappedMarkFromLabel(labelIndex);
                _this.returnLabel(this);
                return false;
              }
            }
            return false;
          },
          cursor: 'url("../../img/cursors/grabbing.png"), pointer',
          revertDuration: Config.animation.duration,
          start: (ev, ui) => this.onLabelDragStart(ev, ui),
        });
      },
      
      makeTrapsDroppable() {
        $(`.${this.classes.trap}`)
          .droppable({
            tolerance: 'intersect',
            drop: (ev, ui) => {
              this.onLabelDrop(ev, ui);
            },
            over: (ev, ui) => {
              this.onLabelOver(ev, ui);
            },
            out: (ev, ui) => {
              this.onLabelOut(ev, ui);
            }
          })
          .droppable('option', 'disabled', false);
      },
      
      isWrongLabel($label) {
        return $label.hasClass(this.classes.wrong);
      },
      
      addDragAndDropFunctionality() {
        this.makeLabelsDraggable();
        this.makeTrapsDroppable();
      },
  
      hasEmptyTrap(trapped) {
        return trapped.indexOf(-1) !== -1;
      },
      
      isLabelInTrap($el, trapIndex) {
        return this.getLabelIndex($el) === this.trapped[trapIndex]
      },
      
      getSequence() {
        let seq = [];
        let labelIndex;
        for (let i = 0; i < this.trapped.length; i++) {
          labelIndex = this.trapped[i];
          // TODO: Hardcoded values should be removed!
          switch (labelIndex) {
            case 1:
              seq.push(2);
              seq.push(3);
              break;
            case 2:
              seq.push(0);
              break;
            case 4:
              seq.push(1);
              break;
          }
        }
        return seq;
      },
      
      /**
       * Event callbacks
       */
      
      /**
       * Vue events
       */
      
      onRestart() {
        this.onReset(1);
      },
  
      onReset(stepIndex) {
        if (stepIndex !== 1)
          return;
        this.complete = false;
    
        this.removeLabels();
        this.disableButton();
        this.shrinkLabelNumber();
        this.resetTrappedArray();
    
        this.renderLabels();
        this.addDragAndDropFunctionality();
      },
  
      onValidate(stepIndex) {
        if (stepIndex !== 1)
          return;
    
        let correct = this.content.traps.correct;
        this.complete = true;
    
        this.trapped.forEach((labelIndex) => {
          if (correct.indexOf(labelIndex) !== -1) {
            this.highlightCorrect(labelIndex);
          } else {
            this.complete = false;
            this.highlightWrong(labelIndex);
          }
        });
    
        if (this.complete) {
          this.eventBus.$emit(VueEvents.validation.finish);
          this.eventBus.$emit(VueEvents.step.parseData, this.getSequence());
          this.removeWrongLabels();
          this.disposePair();
          this.disableDragAndDropFunctionality();
        }
      },
  
      onStepChange(stepIndex) {
        if (stepIndex !== 2)
          return;
        
        this.getSequence();
      },
      
      /**
       * jQuery UI events
       */
      
      onLabelDrop(ev, ui) {
        let $trap = $(ev.target);
        let $label = ui.draggable;
        let trapIndex = this.getTrapIndex($trap);
    
        if (this.hasLabel($trap)) {
          this.disableShadowOnTrappedLabel($trap);
          if (!this.isLabelInTrap($label, trapIndex)) {
            this.returnLabel(this.getTrappedLabel(trapIndex));
            this.removeTrappedMark(trapIndex);
          }
        }
        this.trapLabel(ev, ui);
      },
  
      onLabelOver(ev, ui) {
        let $trap = $(ev.target);
        if (this.hasLabel($trap)) {
          let trapIndex = this.getTrapIndex($trap);
          let $label = this.getTrappedLabel(trapIndex);
          
          if (this.isWrongLabel($label)) {
            this.removeHighlight($label);
            this.returnLabel($label);
            this.removeTrappedMark(trapIndex);
          } else {
            this.enableShadowOnTrappedLabel($trap);
          }
        }
      },
  
      onLabelOut(ev, ui) {
        let $trap = $(ev.target);
        if (this.hasLabel($trap)) {
          this.disableShadowOnTrappedLabel($trap);
        }
      },
      
      onLabelDragStart(ev, ui) {
        let $label = $(ui.helper);
        this.removeHighlight($label);
      }
    },
    watch: {
      trapped: function(newV) {
        if (this.hasEmptyTrap(newV)) {
          this.disableButton();
        } else {
          this.enableButton();
        }
      }
    }
  }
</script>

<style lang="scss">
  @import "~themes/styles.scss";
  @import "~themes/custom.scss";
  @import "~fonts/ConquerorSans/ConquerorSans.css";

  @keyframes wrong-label {
    100%    { transform: translate(15px, -5px); }
  }
  
  div.label {
    @include label-text();
    @include label-box-shadow-dragged();
    width: $label-width - $label-padding * 2;
    color: #00a095;
    /*height: 34px;*/
    padding: 3px $label-padding;
    position: absolute;
    /*line-height: 34px;*/
    border-radius: 2px;
    border-bottom: 2px solid #00a095;
    background-color: white;
    
    &.label-over-trapped-label {
      background-color: #f0f0f0;
    }
    
    &.trapped {
      @include label-box-shadow-trapped();
    }
    
    &.wrong {
      border-bottom-color: #f48154;
      -webkit-animation: wrong-label .4s forwards; /* Safari 4+ */
      -moz-animation:    wrong-label .4s forwards; /* Fx 5+ */
      -o-animation:      wrong-label .4s forwards; /* Opera 12+ */
      animation:         wrong-label .4s forwards; /* IE 10+, Fx 29+ */
      @include label-box-shadow-dragged();
    }
    
    &.correct {
      border-bottom-color: #13ebdc;
      color: black;
    }
    
    &:hover {
      cursor: pointer;
      border-bottom-color: #ffe66c;
    }
  
    &:hover:not(.ui-draggable-dragging) {
      cursor: url("../../img/cursors/grab.png"), pointer;
    }
  
    &.ui-draggable-dragging {
      @include label-box-shadow-dragging();
      cursor: url("../../img/cursors/grabbing.png"), pointer;
    }
  
  
  }
  
  #LabelDrag-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    
    & > #traps {
      & > div {
        display: flex;
        align-items: center;
        flex-direction: row;
        &:not(:last-child) {
          margin-bottom: 22px;
        }
        
        & > .index {
          margin-right: 12px;
          font-size: 15px;
          font-family: ConquerorSansBold, sans-serif;
          font-weight: normal;
        }
        
        & > .trap {
          @include border-radius(3px);
          width: $label-width;
          min-height: $label-height;
          box-shadow: inset 0 2px 2px 2px #e9e9e9;
          background-color: #f9f9f9;
          
          &.disabled {
            box-shadow: none;
            background-color: white;
          }
          &.ui-droppable-hover {
            box-shadow: inset 0 2px 2px 2px #e4ce60;
            background-color: #ffe66c;
          }
        }
      }
    }
    
    & > #labels {
      display: flex;
      align-items: center;
      flex-direction: column;
      
      & > div.label-wrapper {
        width: $label-width;
        height: $label-height;
        
        &:not(:last-child) {
          margin-bottom: 22px;
        }
      }
    }
  }
</style>