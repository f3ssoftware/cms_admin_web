<template>
  <div
    class="form-group"
    :class="{
      'input-group': hasIcon,
      'input-group-focus': focused,
    }"
  >
    <slot name="label">
      <label v-if="label" class="control-label">
        {{ label }}
      </label>
    </slot>
    <slot name="addonLeft">
      <span v-if="addonLeftIcon" class="input-group-prepend">
        <div class="input-group-text">
          <i :class="addonLeftIcon"></i>
        </div>
      </span>
    </slot>
    <slot>
      <input
        :value="inputValue"
        v-bind="$attrs"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
        class="form-control"
        aria-describedby="addon-right addon-left"
      />
    </slot>
    <slot name="addonRight">
      <span v-if="addonRightIcon" class="input-group-append">
        <div class="input-group-text">
          <i :class="addonRightIcon"></i>
        </div>
      </span>
    </slot>
    <slot name="helperText"></slot>
  </div>
</template>
<script>
export default {
  inheritAttrs: false,
  name: "base-input",
  props: {
    label: {
      type: String,
      description: "Input label",
    },
    modelValue: {
      type: [String, Number],
      default: "",
      description: "Input value (Vue 3 v-model)",
    },
    value: {
      type: [String, Number],
      default: "",
      description: "Input value (Vue 2 compatibility)",
    },
    addonRightIcon: {
      type: String,
      description: "Input icon on the right",
    },
    addonLeftIcon: {
      type: String,
      description: "Input icon on the left",
    },
  },
  // Vue 2 compatibility
  model: {
    prop: "value",
    event: "input",
  },
  data() {
    return {
      focused: false,
    };
  },
  computed: {
    hasIcon() {
      const { addonRight, addonLeft } = this.$slots;
      return (
        addonRight !== undefined ||
        addonLeft !== undefined ||
        this.addonRightIcon !== undefined ||
        this.addonLeftIcon !== undefined
      );
    },
    // Support both Vue 2 (value) and Vue 3 (modelValue) patterns
    inputValue() {
      return this.modelValue !== undefined && this.modelValue !== "" 
        ? this.modelValue 
        : this.value;
    },
  },
  methods: {
    onInput(evt) {
      const newValue = evt.target.value;
      // Emit for Vue 3 v-model
      this.$emit("update:modelValue", newValue);
      // Emit for Vue 2 compatibility
      this.$emit("input", newValue);
    },
    onFocus() {
      this.focused = true;
    },
    onBlur() {
      this.focused = false;
    },
  },
};
</script>
<style></style>
