<template>
  <div class="preview-container">
    <iframe
        ref="previewFrame"
        class="preview-frame"
        sandbox="allow-scripts"
        frameborder="0"
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'index',
  props: {
    htmlContent: {
      type: String,
      default: ''
    }
  },
  watch: {
    htmlContent: {
      handler(newValue) {
        this.updateIframeContent(newValue);
      },
      immediate: true // 立即执行一次以初始化内容
    }
  },
  methods: {
    updateIframeContent(content) {
      const iframeDocument = this.$refs.previewFrame.contentDocument;
      iframeDocument.open();
      iframeDocument.write(content);
      iframeDocument.close();
    }
  }
};
</script>

<style scoped>
.preview-container {
  width: 100%;
  height: 100%;
}

.preview-frame {
  width: 100%;
  height: 100%;
}
</style>
