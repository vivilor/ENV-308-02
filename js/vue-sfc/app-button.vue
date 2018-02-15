<template lang="pug">
  div#app-button-wrapper(
    :class="renderClasses()",
    @click="onClick()"
  )
    div(v-html="content.html")
</template>

<script>
  import VueEvents from "../events"
  
  /**
   * There are several types of button style:
   *  - normal (default)
   *  - danger
   *  - light
   */
  export default {
    name: "app-button",
    props: {
      content:  { type: Object, required: true },
      eventBus: { type: Object, required: true }
    },
    data() {
      return {
        disabled: false,
      }
    },
    computed: {
      name() {
        return this.content.name
      }
    },
    methods: {
      renderClasses() {
        return [
          this.content.type || "normal",
          this.disabled ? "disabled" : ""
        ]
      },
      
      onClick() {
        if (!this.disabled) {
          this.eventBus.$emit(VueEvents.buttons.click, this.name);
        }
      },
      
      onEnable(buttonName) {
        if (buttonName === this.name) {
          this.disabled = false;
        }
      },
      
      onDisable(buttonName) {
        if (buttonName === this.name) {
          this.disabled = true;
        }
      },
      
      handleEvents() {
        this.eventBus.$on(VueEvents.buttons.enable,  this.onEnable);
        this.eventBus.$on(VueEvents.buttons.disable, this.onDisable);
      }
    },
    mounted() {
      this.handleEvents();
    }
  }
</script>

<style lang="scss" scoped>
  @import "~fonts/ConquerorSans/ConquerorSans.css";
  
  div#app-button-wrapper {
    display: inline-block;
    transition: .3s linear;
    border-radius: 3px;
    
    & > div {
      text-align: center;
      font-family: "ConquerorSans", sans-serif;
      font-size: 17px;
      line-height: 36px;
      min-width: 116px;
    }
    &:hover {
      cursor: pointer;
    }
    
    &.normal {
      background-color: #4ecdc4;
      color: white;
    }
    
    &.danger {
      background-color: #ff6b6b;
      color: white;
    }
    
    &.light {
      background-color: white;
      color: #4ecdc4;
    }
    
    &.disabled {
      background-color: #d8dad4;
    }
  }
</style>