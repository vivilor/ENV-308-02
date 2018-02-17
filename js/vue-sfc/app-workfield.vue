<template lang="pug">
  div#app-workfield-wrapper
    div
      h1#app-header(
        v-if="content.header",
        v-html="content.header"
      )
      
      div#restart-task-button(
        v-on:click="onRestartButtonClick"
      )
      
      app-steps-panel(
        v-if="stepsCount > 1",
        v-bind:steps-count="stepsCount",
        v-bind:current-step="currentStep"
      )
      
      app-steps-header(
        v-bind:content="content.steps.headers",
        v-bind:current-step="currentStep"
      )
      
      /////////////////////////////////////////////////////////////////////////
      // Customizable part of this component starts here
      
      div#steps-content-wrapper
        transition(name="step1")
          label-drag(
            v-show="currentStep === 1",
            v-bind:eventBus="eventBus",
            v-bind:content="content.steps.data[0]"
          )
        transition(name="step2")
          label-choose(
            v-show="currentStep > 1",
              v-bind:eventBus="eventBus",
              v-bind:content="content.steps.data[1]"
            )
        
      div#app-control-buttons-wrapper
        app-button(
          v-if="!completed"
          v-bind:event-bus="eventBus",
          v-bind:content="content.buttons.validateStep"
        )
        app-button(
          v-if="completed"
          v-bind:event-bus="eventBus",
          v-bind:content="content.buttons.continueTask"
        )
      //
      /////////////////////////////////////////////////////////////////////////
</template>

<script>
  import Vue from "vue"
  import VueEvents from "../events"
  
  import AppButton from "./app-button.vue"
  import AppStepsPanel from "./app-steps-panel.vue"
  import AppStepsHeader from "./app-steps-header.vue"
  
  import LabelDrag from "./label-drag.vue"
  import LabelChoose from "./label-choose.vue"
  
  import Content from "locale/ru-ru.json"
  
  export default {
    name: "app-workfield",
    data: function() {
      return {
        content: Content,
        eventBus: new Vue(),
        
        stepsCount: Content.steps.count,
        currentStep: 0,
        completed: false
      }
    },
    components: {
      AppButton,
      AppStepsPanel,
      AppStepsHeader,
      LabelDrag,
      LabelChoose
    },
  
    mounted() {
      this.handleEvents();
      this.$nextTick(() => this.currentStep = 1);
    },
    
    methods: {
      requestStepValidation() {
        this.eventBus.$emit(VueEvents.validation.start, this.currentStep)
      },
      
      handleEvents() {
        this.eventBus.$on(VueEvents.validation.finish, this.onValidateFinish);
        this.eventBus.$on(VueEvents.buttons.click, this.onButtonClick);
      },
  
      onButtonClick(buttonName) {
        switch (buttonName) {
          case Content.buttons.validateStep.name:
            this.requestStepValidation();
            break;
          case Content.buttons.continueTask.name:
            this.requestTaskContinue();
            break;
        }
      },
      
      requestTaskContinue() {
        this.currentStep++;
        this.eventBus.$emit(VueEvents.step.change, this.currentStep);
      },
      
      onRestartButtonClick() {
        this.currentStep = 1;
        this.completed = false;
        this.eventBus.$emit(VueEvents.step.change, this.currentStep);
        this.eventBus.$emit(VueEvents.global.restart);
      },
      
      onValidateFinish() {
        switch (this.currentStep) {
          case 1:
            this.completed = true;
            break;
          case 2:
            break;
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~fonts/ConquerorSans/ConquerorSans-ExtraBold.css";
  
  .step1-enter        { opacity: 0 }
  .step1-enter-active { transition: .4s linear }
  .step1-enter-to     { opacity: 1 }
  .step1-leave        { opacity: 1 }
  .step1-leave-active { transition: .4s linear }
  .step1-leave-to     { opacity: 0 }

  .step2-enter        { opacity: 0 }
  .step2-enter-active { transition: .4s linear .4s }
  .step2-enter-to     { opacity: 1 }
  .step2-leave        { opacity: 1 }
  .step2-leave-active { transition: .1s linear }
  .step2-leave-to     { opacity: 0 }
  
  #steps-content-wrapper {
    height: 474px;
  }
  
  div#app-workfield-wrapper {
    
    // TODO: Don't use size constants
    width: 960px;
    height: 600px;
    margin: auto;
    display: flex;
    
    & > div {
      width: 912px;
      height: 542px;
      margin: 22px 34px 36px 34px;
      position: relative;
      /*overflow: hidden;*/
      
      & > h1 {
        margin: 0 0 10px 0;
        font-size: 28px;
        line-height: 32px;
        font-family: ConquerorSansExtraBold, sans-serif;
        font-weight: normal;
      }
      
      & > div {
        &#restart-task-button {
          background-image: url(../../img/reload.svg);
          width: 23px;
          height: 28px;
          position: absolute;
          right: 0;
          top: 0;
          cursor: pointer;
          
          &:hover {
            background-image: url(../../img/reload-hover.svg);
          }
        }
        
        &#app-control-buttons-wrapper {
          display: flex;
          position: absolute;
          justify-content: flex-end;
          bottom: 0;
          right: 0;
          
          & > div:not(:last-child) {
            margin-right: 5px;
          }
        }
      }
    }
  }
</style>