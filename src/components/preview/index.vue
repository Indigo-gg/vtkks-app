<template>
  <div class="preview-container">
    <div v-if="!isShowVis" class="code-container">
      <pre><code class="hljs" v-html="highlightedCode"></code></pre>
    </div>
    <div class="preview-frame" v-else="isShowVis">
      <iframe
          ref="previewFrame"
          sandbox="allow-scripts allow-same-origin allow-top-navigation"
          style="width: 100%;height:100%"
          src="about:blank"
          frameBorder="0"
      ></iframe>
    </div>

  </div>
</template>

<script>
import {onMounted, nextTick, ref, watch, computed} from 'vue';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 选择一种高亮主题

export default {
  name: 'index',
  props: {
    htmlContent: {
      type: String,
      required: true,
    },
    isShowVis:{
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup(props) {
    const previewFrame = ref(null);

    onMounted(async () => {
      await nextTick(); // 确保DOM更新
    });


    function extractHtmlCode(input) {
      const regex = /```html([\s\S]*?)```/
      const match = input.match(regex);

      // 如果匹配成功，返回提取的代码，否则返回
      return match ? match[1].trim() : input;
}
    const highlightedCode=computed(()=> {

      return hljs.highlightAuto(extractHtmlCode(props.htmlContent)).value;
    })


    function loadHtmlContentIntoIframe() {
      const iframe = previewFrame.value;
      if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write('');
        doc.close();

        nextTick(() => {
          doc.open();
          doc.write(extractHtmlCode(props.htmlContent));
          doc.close();
        });
      }
    }

    watch(() => props.isShowVis, (newValue) => {
      if (newValue) {
        console.log(`isShowVis changed to `+ newValue);
        nextTick(()=>{
          loadHtmlContentIntoIframe();
        })
      }
    });
    return {
      previewFrame,
      highlightedCode
    };
  }
};
</script>

<style scoped>
.preview-container {
  width: 100%;
  height: 70vh;
  /*background-color: #2c3e50;*/
  margin: 5px;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none; /* 可选：移除边框 */
}
.code-container{
  height: 100%;
}
.code-container pre {
  margin: 0;
  padding: 10px;
  height: 100%;
  text-align: left;
  /*background-color: #f6f8fa; !* 背景色 *!*/
  border-radius: 4px; /* 圆角 */
  overflow-x: auto; /* 水平溢出时滚动 */
}

.hljs {
  font-family: 'Courier New', Courier, monospace; /* 等宽字体 */
  font-size: 14px;
}
</style>
