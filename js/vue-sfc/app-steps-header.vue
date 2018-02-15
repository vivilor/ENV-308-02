<template lang="pug">
  h2#app-step-header(
    v-if="currentStep > 0",
    v-html="content[currentStep - 1].header"
  )
</template>

<script>
  export default {
    name: "app-steps-header",
    props: {
      content: {
        type: Array,
        required: true
      },
      currentStep: {
        required: true
      }
    }
  }
</script>

<style scoped>
  h2#app-step-header {
    margin: 0;
    height: 56px;
    font-size: 23px;
    font-family: ConquerorSans, sans-serif;
    line-height: 28px;
    font-weight: normal;
  }
</style>