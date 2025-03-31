<template>

  <div class="home">
    <div class="head">
      <div class="title">
        {{ title }}
      </div>
      <!-- 移除原来的导出按钮 -->
      <div class="setting">
        <div class="showVis">
          <v-switch v-model="isShowVis" hide-details inset :label="isShowVis ? 'Visible' : 'Hidden'"
            @change="handleVisibilityChange"></v-switch>
        </div>
        <div class="enableEval">
          <v-switch v-model="isEnableEval" hide-details inset :label="isEnableEval ? 'evl open' : 'evl close'"
            @change="handleEvalChange"></v-switch>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="left">
        <div class="iteration-status" v-if="currentCase.workflow.iterativeLoop">
          <v-chip :color="currentCase.errorCount > 0 ? 'warning' : 'success'" class="ma-2">
            迭代次数: {{ currentCase.errorCount }}/{{ currentCase.maxIterations }}
          </v-chip>
          <v-progress-linear v-if="isIterating" indeterminate color="primary" class="mb-2"></v-progress-linear>
        </div>
        <div class="preview">
          <preview class="scrollable" :is-show-vis="isShowVis" :htmlContent="currentCase.generatedCode"
            @console-output="handleConsoleOutput" ref="generatedPreview">
            <template #actions>
              <v-btn v-if="isShowVis" :icon="isFullScreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'" size="small"
                variant="text" @click="toggleFullScreen('generated')" class="fullscreen-btn"></v-btn>
            </template>
          </preview>
          <preview class="scrollable" :is-show-vis="isShowVis" :htmlContent="currentCase.groundTruth"
            ref="truthPreview">
            <template #actions>
              <v-btn v-if="isShowVis" :icon="isFullScreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'" size="small"
                variant="text" @click="toggleFullScreen('truth')" class="fullscreen-btn"></v-btn>
            </template>
          </preview>
        </div>
        <!-- 在输出组件部分添加导出按钮 -->
        <div class="output">
          <div class="output-container">
            <Output :console-output="currentCase.consoleOutput" :evaluator-output="currentCase.evaluatorEvaluation">
            </Output>
            <v-btn v-if="currentCase.evaluatorEvaluation" icon="mdi-export" size="small" color="blue"
              @click="exportResults" :loading="isExporting" class="export-btn">
            </v-btn>
          </div>
        </div>
      </div>
      <div class="right">
        <config :case-list="caseList" @end="handleSeGenEnd" @getNewCase="setCurrentCase">
        </config>
      </div>
    </div>

    <v-snackbar v-model="info.snackbar" :timeout="info.timeout">
      {{ info.message }}

      <template v-slot:actions>
        <v-btn color="blue" variant="text" @click="info.snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

  </div>

</template>


<script>
import preview from "@/components/preview/index.vue";
import config from "@/components/config/index.vue";
import output from "@/components/output/index.vue"
import axios from "axios";
import { nextTick, onMounted, reactive, ref } from "vue";
import { getAllCase, getEvalResult, generateCode } from "@/api/api.js";
import { appConfig } from "@/view/config.js";
import html2canvas from 'html2canvas';  // 需要安装这个包
import { ExportUtils } from '@/utils/export';

export default {
  name: "home",
  components: {
    preview,
    config,
    Output: output
  },
  setup() {
    const caseList = ref([])
    const info = reactive({
      message: '',
      timeout: 3000,
      snackbar: false
    })
    let isShowVis = ref(false)
    const isEnableEval = ref(false); // 默认关闭评估

    const handleEvalChange = (value) => {
      console.log("Evaluation enabled:", value.target.checked);
      isEnableEval.value = value.target.checked;
    };
    const isExporting = ref(false);
    const currentCase = reactive({
      evalId: 0,
      prompt: '',
      // groundTruth: appConfig.testCode,
      groundTruth: 'Ground Truth:',
      // generatedCode: appConfig.testGeneratedCode,
      generatedCode: 'Generated Code:',
      evaluatorPrompt: appConfig.evaluator_prompt,
      generator: '',
      evaluator: '',
      evaluatorEvaluation: '',
      consoleOutput: [],
      workflow: {
        inquiryExpansion: false,
        rag: false,
        iterativeLoop: false,
      },
      evalUser: appConfig.eval_user,
      score: '',
      manualEvaluation: [],
      options: '',
      errorCount: 0,
      maxIterations: 3

    })
    const resetCurrentCase = (obj) => {
      currentCase.evalId = obj['eval_id']
      currentCase.score = obj['score']
      currentCase.evalId = obj['eval_id']
      currentCase.generatedCode = obj['generated_code']
      currentCase.manualEvaluation = obj['manual_evaluation']
      currentCase.options = obj['options']
      currentCase.evaluatorEvaluation = obj['evaluator_evaluation']
    }
    const isIterating = ref(false);

    const handleSeGenEnd = async (res) => {
      try {
        currentCase.consoleOutput = []
        if (currentCase.workflow.iterativeLoop) {
          currentCase.errorCount = 0
          currentCase.maxIterations = 3
        }
        resetCurrentCase(res)
        isShowVis.value = true;

        // 等待预览组件渲染完成
        await nextTick();

        // 等待两个 iframe 加载完成
        const generatedPreviewEl = generatedPreview.value.$el.querySelector('.preview-content');
        const truthPreviewEl = truthPreview.value.$el.querySelector('.preview-content');

        await Promise.all([
          new Promise((resolve) => {
            if (generatedPreviewEl && generatedPreviewEl.contentDocument.readyState === 'complete') {
              resolve();
            } else {
              generatedPreviewEl.onload = resolve;
            }
          }),
          new Promise((resolve) => {
            if (truthPreviewEl && truthPreviewEl.contentDocument.readyState === 'complete') {
              resolve();
            } else {
              truthPreviewEl.onload = resolve;
            }
          })
        ]);

        // 额外等待一段时间确保 VTK.js 初始化完成
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 现在检查错误
        const hasError = res.error ||
            (res.options && res.options.error_log) ||
            currentCase.consoleOutput.some(log => log.type === 'error');

        console.log('hasError', hasError, 'currentCase.workflow.iterativeLoop', currentCase.workflow.iterativeLoop,
            'currentCase.errorCount', currentCase.errorCount, 'currentCase.maxIterations', currentCase.maxIterations);

        if (hasError && currentCase.workflow.iterativeLoop) {
          isIterating.value = true;  // 开始迭代
          if (currentCase.errorCount < currentCase.maxIterations) {
            currentCase.errorCount++
            info.message = `代码存在错误，正在进行第${currentCase.errorCount}次优化...`
            info.snackbar = true

            let errors = []
            if (res.error) {
              errors.push({type: 'error', message: res.error})
            }
            if (res.options && res.options.error_log) {
              errors.push({type: 'error', message: res.options.error_log})
            }
            if (currentCase.consoleOutput.length > 0) {
              errors.push(...currentCase.consoleOutput.filter(log => log.type === 'error'))
            }

            // 调用错误分析接口
            handleCodeError({
              errors: errors,
              current_code: currentCase.generatedCode
            }).then(analysisRes => {
              if (analysisRes.data.errors && analysisRes.data.errors.length > 0) {
                // 使用新的代码继续迭代
                currentCase.generatedCode = analysisRes.data.new_code
                info.message = `正在应用优化建议...`
                info.snackbar = true
                handleSeGenEnd({
                  ...res,
                  generated_code: analysisRes.data.new_code
                })
              } else {
                isIterating.value = false;  // 迭代完成
                info.message = `代码已优化完成`
                info.snackbar = true
                // 根据开关状态决定是否进行评估
                if (isEnableEval.value) {
                  getEvalResult(currentCase).then(evalRes => {
                    currentCase.score = evalRes.data['score'];
                    currentCase.evaluatorEvaluation = evalRes.data['evaluator_evaluation'];
                  });
                }
              }
            })
            return
          } else {
            isIterating.value = false;  // 达到最大迭代次数
            info.message = '已达到最大迭代次数'
            info.snackbar = true
          }
        } else {
          isIterating.value = false;  // 无需迭代
          // 如果没有错误或未开启迭代循环或已达到最大迭代次数，进入评估环节
          // 根据开关状态决定是否进行评估
          if (isEnableEval.value) {
            getEvalResult(currentCase).then(res => {
              console.log('evaluation', res.data);
              currentCase.score = res.data['score'];
              currentCase.evaluatorEvaluation = res.data['evaluator_evaluation'];
              info.message = '评估完成';
              info.snackbar = true;
            });
          } else {
            info.message = '已跳过评估';
            info.snackbar = true;
          }
        }
      } catch (error) {
        console.error('处理生成结果时出错:', error);
        info.message = '处理生成结果时出错';
        info.snackbar = true;
        isIterating.value = false;
      }
    }
      const setCurrentCase = (caseItem) => {
        currentCase.prompt = caseItem.prompt
        currentCase.groundTruth = caseItem.groundTruth
        currentCase.generator = caseItem.generator
        currentCase.evaluator = caseItem.evaluator
        currentCase.evalUser = caseItem.evalUser
        currentCase.evaluatorPrompt = caseItem.evaluatorPrompt
        currentCase.workflow = caseItem.workflow
        // currentCase.currentGeneratedCode=currentGeneratedCode.value
      }

      const handleConsoleOutput = (output) => {

        nextTick(() => {
          // 在这里处理控制台输出
          console.log('handleConsoleOutput', currentCase.consoleOutput)
          currentCase.consoleOutput = output
        })
        // 在这里处理控制台输出
        // console.log('handleConsoleOutput',currentCase.consoleOutput)
        // currentCase.consoleOutput=output
      };
      const init = () => {
        getAllCase().then(res => {
          // console.log('caseList',res)
          caseList.value.push(...res.data)
        })
      }
      const handleVisibilityChange = (value) => {
        console.log("Visibility changed:", value.target.checked);
        isShowVis.value = value.target.checked
        // 在这里可以添加其他逻辑，例如更新组件显示状态
      };
      onMounted(() => {
        init()
      })
      const isFullScreen = ref(false);
      const generatedPreview = ref(null);
      const truthPreview = ref(null);

      const toggleFullScreen = async (type) => {
        const container = type === 'generated'
          ? generatedPreview.value.$el
          : truthPreview.value.$el;

        if (!document.fullscreenElement) {
          await container.requestFullscreen();
          isFullScreen.value = true;
        } else {
          await document.exitFullscreen();
          isFullScreen.value = false;
        }
      };
      const exportResults = async () => {
        try {
          isExporting.value = true;

          // 确保预览组件已经渲染完成
          await nextTick();

          // 获取预览组件实例
          const generatedPreviewInstance = generatedPreview.value;
          const truthPreviewInstance = truthPreview.value;

          // 获取预览组件中的实际内容容器
          const generatedContent = generatedPreviewInstance.$el.querySelector('.preview-content');
          const truthContent = truthPreviewInstance.$el.querySelector('.preview-content');

          if (!generatedContent || !truthContent) {
            throw new Error('无法获取预览内容');
          }

          // 等待 iframe 加载完成
          await Promise.all([
            new Promise(resolve => {
              if (generatedContent.contentDocument.readyState === 'complete') {
                resolve();
              } else {
                generatedContent.onload = resolve;
              }
            }),
            new Promise(resolve => {
              if (truthContent.contentDocument.readyState === 'complete') {
                resolve();
              } else {
                truthContent.onload = resolve;
              }
            })
          ]);

          const result = await ExportUtils.exportResults(
            currentCase,
            {
              generatedPreviewEl: generatedContent.contentDocument.body,
              truthPreviewEl: truthContent.contentDocument.body
            }
          );

          info.message = result.message;
          info.snackbar = true;
        } catch (error) {
          console.error('导出错误:', error);
          info.message = '导出失败: ' + error.message;
          info.snackbar = true;
        } finally {
          isExporting.value = false;
        }
      };

      // 监听全屏变化
      onMounted(() => {
        document.addEventListener('fullscreenchange', () => {
          isFullScreen.value = !!document.fullscreenElement;
        });
      });

      // 在 return 中添加新的属性
      return {
        title: 'Vtkjs Evaluator',
        caseList,
        handleSeGenEnd,
        setCurrentCase,
        currentCase,
        info,
        isShowVis,
        handleVisibilityChange,
        handleConsoleOutput,
        // 添加全屏相关的属性
        isFullScreen,
        generatedPreview,
        truthPreview,
        toggleFullScreen,
        isExporting,
        exportResults,
        isEnableEval,
        handleEvalChange,
      };
    }
  }
</script>

<style scoped>
.home {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /*align-items: center;*/
}

.head {
  height: 10vh;
  width: 100vw;
  display: flex;
  justify-content: space-between;
  /* 确保两端对齐 */
  align-items: center;
  /* 垂直居中 */
  padding: 10px;
  background-color: #f0f0f0;
}

.container {
  height: 90vh;
  display: flex;
  /*justify-content: space-around;*/
  /*flex: 10 2 auto;*/
  padding: 10px;
}

.left,
.right {
  padding: 10px;
  overflow-y: scroll;
}

.left {
  flex: 10;
}

.right {
  flex: 2;
}

.preview {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  position: relative;
  /* 添加相对定位 */
}

.scrollable {
  overflow-y: auto;
  max-height: 80vh;
  border: 1px solid #ccc;
  padding: 10px;
  position: relative;
  /* 添加相对定位 */
}

.fullscreen-btn {
  position: absolute !important;
  top: 8px;
  right: 8px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(4px);
}

.title {
  flex: 9;
}

.head .setting {
  flex: 3;
  display: flex;
  gap: 16px;
  align-items: center;
}

.iteration-status {
  padding: 8px;
  margin-bottom: 16px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.iteration-status .v-chip {
  margin-right: 8px;
}

.output-container {
  position: relative;
  width: 100%;
}

.export-btn {
  position: absolute !important;
  top: 8px;
  right: 8px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(4px);
}
</style>
