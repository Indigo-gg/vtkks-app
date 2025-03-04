<template>

  <div class="home">
    <div class="head">
      <div class="title">
        {{title}}
      </div>
      <div class="setting">
        <div class="showVis">
          <v-switch
              v-model="isShowVis"
              hide-details
              inset
              :label="isShowVis ? 'Visible' : 'Hidden'"
              @change="handleVisibilityChange"
          ></v-switch>
        </div>
<!--        <div class="config">-->
<!--          <v-btn icon>-->
<!--            <v-icon>midi-cog</v-icon>-->
<!--          </v-btn>-->
<!--        </div>-->
      </div>
    </div>
    <div class="container">
      <div class="left">
        <div class="preview">
<!--          <div class="scrollable">-->
            <preview class="scrollable" :is-show-vis="isShowVis" :htmlContent="currentCase.generatedCode">
            </preview>
<!--          </div>-->
<!--          <div class="scrollable">-->
            <preview class="scrollable" :is-show-vis="isShowVis" :htmlContent="currentCase.groundTruth">
            </preview>
<!--          </div>-->

        </div>
        <div class="output">
          <Output :console-output="currentCase.consoleOutput" :evaluator-output="currentCase.evaluatorEvaluation">

          </Output>
        </div>
      </div>
    <div class="right">
        <config :case-list="caseList" @start="handleGenStart" @end="handleSeGenEnd" @getNewCase="setCurrentCase"></config>
      </div>
    </div>

    <v-snackbar
        v-model="info.snackbar"
        :timeout="info.timeout"
    >
      {{ info.message }}

      <template v-slot:actions>
        <v-btn
            color="blue"
            variant="text"
            @click="info.snackbar = false"
        >
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
import {onMounted, reactive, ref} from "vue";
import {getAllCase, getEvalResult} from "@/api/api.js";
import {appConfig} from "@/view/config.js";
export default {
  name: "home",
  components: {
    preview,
    config,
    Output:output
  },
  setup() {
    const caseList=ref([])
    const info=reactive({
      message: '',
      timeout: 3000,
      snackbar: false
    })
    let isShowVis=ref(false)
    const currentCase=reactive({
      evalId:0,
      prompt: '',
      groundTruth: 'groundTruth:',
      generatedCode:'generatedCode:',

      // fileName: null,
      evaluatorPrompt: appConfig.evaluator_prompt,
      generator:'',
      evaluator:'',
      evaluatorEvaluation:'',
      consoleOutput: '',
      workflow:{
        inquiryExpansion:false,
        rag:false,
        iterativeLoop:false,
      },
      evalUser:appConfig.eval_user,
      score:'',
      manualEvaluation:[],
      options:''

    })
    const resetCurrentCase=(obj)=>{
      currentCase.evalId=obj['eval_id']
      currentCase.score=obj['score']
      currentCase.evalId=obj['eval_id']
      currentCase.generatedCode=obj['generated_code']
      currentCase.manualEvaluation=obj['manual_evaluation']
      currentCase.options=obj['options']
      currentCase.evaluatorEvaluation=obj['evaluator_evaluation']
    }
    const handleGenStart= (res)=>{
      // 创建一个读取器
      // resetCurrentCase(res)
      // currentCase.generatedCode=res.generatedCode
      console.log('currentGeneratedCode',res)
    }
    const handleSeGenEnd= (res)=>{
      // 创建一个读取器
      resetCurrentCase(res)

      currentCase.generatedCode=res['generated_code']
      // console.log('generatedCode',currentCase.generatedCode)
      getEvalResult(currentCase).then(res=>{
        // print('evalution'+res.data)
        console.log('evaluation',res.data)
        currentCase.score=res.data['score']
        currentCase.evaluatorEvaluation=res.data['evaluator_evaluation']
        info.message='evaluation end'
        info.snackbar=true
      })

    }
    const setCurrentCase=(caseItem)=>{
      currentCase.prompt=caseItem.prompt
      currentCase.groundTruth=caseItem.groundTruth
      currentCase.generator=caseItem.generator
      currentCase.evaluator=caseItem.evaluator
      currentCase.evalUser=caseItem.evalUser
      currentCase.evaluatorPrompt=caseItem.evaluatorPrompt
      currentCase.workflow=caseItem.workflow
      // currentCase.currentGeneratedCode=currentGeneratedCode.value
    }
    const init = () => {
      getAllCase().then(res=>{
        // console.log('caseList',res)
        caseList.value.push(...res.data)
      })
    }
    const handleVisibilityChange = (value) => {
      console.log("Visibility changed:", value,value.target.checked);
      // isShowVis.value=!value.target.checked
      // 在这里可以添加其他逻辑，例如更新组件显示状态
    };
    onMounted(()=>{
      init()
    })
    return {
      title: 'Vtkjs Evaluator',
      caseList,
      handleGenStart,
      handleSeGenEnd,
      setCurrentCase,
      currentCase,
      info,
      isShowVis,
      handleVisibilityChange
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
.head{
  height: 10vh;
  width: 100vw;
  display: flex;
  justify-content: space-between; /* 确保两端对齐 */
  align-items: center; /* 垂直居中 */
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

.left, .right {
  padding: 10px;
  overflow-y: scroll;
}
.left{
  flex: 10;
}
.right{
  flex: 2;
}

.preview{
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.scrollable {
  overflow-y: auto; /* 垂直方向溢出时滚动 */
  max-height: 80vh; /* 设置最大高度，超出部分滚动 */
  border: 1px solid #ccc; /* 可选：添加边框以更好地区分内容 */
  padding: 10px; /* 可选：添加内边距 */
}
.title{
  flex: 9;
}
.head .setting {
  flex:1;
  display: flex;
  justify-content: space-between;
}

</style>
