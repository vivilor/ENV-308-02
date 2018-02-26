<template lang="pug">
  ul#app-steps-panel
    li(v-for="i in stepsCount")
      div(
        :class="{ done: i < currentStep, rest: i > currentStep }"
        v-html="i < currentStep ? '' : i"
      )
      div(
        class="glow",
        v-show="newStep && i === (currentStep - 1)"
      )
</template>

<script>
  export default {
    name: "app-steps-panel",
    
    props: {
      stepsCount: {
        required: true
      },
      currentStep: {
        required: true
      }
    },
    
    data() {
      return { newStep: false }
    },
    
    watch: {
      currentStep(newVal, oldVal) {
        if (newVal > oldVal) {
          this.newStep = true;
          setTimeout( () => this.newStep = false, 300);
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~themes/styles.scss";
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:600');

  @keyframes glow {
    0% { transform: scale(1.2); box-shadow: 0 0 4px 4px #24ddd0; }
    100% { transform: scale(1); opacity: 0 }
  }

  .glow {
    position: absolute;
    top: 0;
    width: 36px;
    height: 36px;
    border-radius: 36px;
    background-color: #24ddd0;
    animation: glow .3s linear;
  }
  
  ul#app-steps-panel {
    list-style-type: none;
    display: flex;
    padding: 0;
    margin: 0 0 10px 0;
    // TODO: Change color constants to variables
    
    & > li {
      width: 34px;
      height: 34px;
      border: #f0f0f0 1px solid;
      line-height: 36px;
      margin-right: 20px;
      border-radius: 20px;
      text-align: center;
      
      & > div {
        font-family: "Open Sans", sans-serif;
        font-size: 17px;
        font-weight: bold;
        color: $main-color;
        line-height: 34px;
        
        &.done {
          width: 17px;
          height: 15px;
          margin-top: 10px;
          margin-left: 8px;
          background-image: url(../../img/check.svg);
          
        }
        
        &.rest {
          color: #d8dad4;
        }
      }
    }
  }
</style>