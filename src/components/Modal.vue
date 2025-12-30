<template>
  <Transition name="slide-y-up" :duration="animationDuration">
    <div
      class="modal fade"
      @click.self="handleBackdropClick"
      :class="[
        { 'show d-block': show },
        { 'd-none': !show },
        { 'modal-mini': type === 'mini' },
      ]"
      v-show="show"
      tabindex="-1"
      role="dialog"
      :aria-hidden="!show"
    >
      <div
        class="modal-dialog"
        :class="[
          { 'modal-notice': type === 'notice' },
          { 'modal-dialog-centered': centered },
          modalClasses,
        ]"
      >
        <div
          class="modal-content"
          :class="[
            gradient ? `bg-gradient-${gradient}` : '',
            modalContentClasses,
          ]"
        >
          <div
            class="modal-header"
            :class="[headerClasses]"
            v-if="$slots.header"
          >
            <slot name="header"></slot>
            <slot name="close-button">
              <button
                type="button"
                class="close"
                v-if="showClose"
                @click="closeModal"
                data-dismiss="modal"
                aria-label="Close"
              >
                <i class="tim-icons icon-simple-remove"></i>
              </button>
            </slot>
          </div>

          <div v-if="$slots.default" class="modal-body" :class="bodyClasses">
            <slot></slot>
          </div>

          <div class="modal-footer" :class="footerClasses" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
<script>
export default {
  name: "modal",
  props: {
    show: Boolean,
    showClose: {
      type: Boolean,
      default: true,
    },
    centered: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: "",
      validator(value) {
        let acceptedValues = ["", "notice", "mini"];
        return acceptedValues.indexOf(value) !== -1;
      },
      description: 'Modal type (notice|mini|"") ',
    },
    modalClasses: {
      type: [Object, String],
      description: "Modal dialog css classes",
    },
    modalContentClasses: {
      type: [Object, String],
      description: "Modal dialog content css classes",
    },
    gradient: {
      type: String,
      description: "Modal gradient type (danger, primary etc)",
    },
    headerClasses: {
      type: [Object, String],
      description: "Modal Header css classes",
    },
    bodyClasses: {
      type: [Object, String],
      description: "Modal Body css classes",
    },
    footerClasses: {
      type: [Object, String],
      description: "Modal Footer css classes",
    },
    animationDuration: {
      type: Number,
      default: 500,
      description: "Modal transition duration",
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true,
      description: "Whether clicking backdrop closes the modal",
    },
  },
  methods: {
    closeModal() {
      this.$emit("update:show", false);
      this.$emit("close");
    },
    handleBackdropClick() {
      if (this.closeOnBackdrop) {
        this.closeModal();
      }
    },
  },
  watch: {
    show(val) {
      let documentClasses = document.body.classList;
      if (val) {
        documentClasses.add("modal-open");
      } else {
        documentClasses.remove("modal-open");
      }
    },
  },
};
</script>
<style>
.modal.show {
  background-color: rgba(0, 0, 0, 0.3);
}

.slide-y-up-enter-active,
.slide-y-up-leave-active {
  transition: all 0.5s ease;
}

.slide-y-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-y-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
