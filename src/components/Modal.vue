<template>
  <div>
    <div class="md-modal modal-msg md-modal-transition" :class="{'md-show':mdShow}">
      <div class="md-modal-inner">
        <div class="md-top">
          <button class="md-close" @click="closeModal">Close</button>
        </div>
        <div class="md-content">
          <div class="confirm-tips">
            <slot name="msg"></slot>
          </div>
          <div class="btn-wrap">
            <slot name="btn-group"></slot>
          </div>
        </div>
      </div>
    </div>
    <div class="md-overlay" v-if="mdShow" @click="closeModal"></div>
  </div>
</template>

<script>
  export default {
    props: ['mdShow'],
    data() {
      return {

      }
    },
    methods: {
      closeModal() {
        this.$emit('close');
      }
    }
  }
</script>











