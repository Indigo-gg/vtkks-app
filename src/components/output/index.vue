<template>
  <v-container>
    <v-row>
      <v-col cols="12">
            <v-row>
              <v-col cols="6">
                <v-card variant="tonal">
                  <v-card-title>Console Output</v-card-title>
                  <v-card-text>
                    <div class="v-card-text markdown-container"  v-html="parseMarkdown(consoleOutput)"></div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card variant="tonal">
                  <v-card-title>Evaluator Output</v-card-title>
                  <v-card-text>
                    <div class="v-card-text markdown-container"  v-html="parseMarkdown(evaluatorOutput)"></div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {marked} from "marked";

export default {
  name: "index",
  props: {
    consoleOutput:{
      type:String,
      required:true
    },
    evaluatorOutput:{
      type:String,
      required:true
    }

  },
  setup() {
      const parseMarkdown=(markdown)=> {
      return marked.parse(markdown);
    }
    return {

        parseMarkdown
    };
  },
};
</script>

<style scoped>
.v-card-text {
  white-space: pre-wrap; /* 保留空白符并自动换行 */
}

.markdown-container {
  text-align: left;
  overflow: auto; /* 溢出时滑动 */
  max-height: 300px; /* 设置最大高度，根据需要调整 */
}
</style>
