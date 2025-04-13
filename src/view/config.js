//定义存储的消息结构

const MSG_LIST = 'app-msgList'

function SysMsgClass(content) {

    return {
        id: Date.now(),
        role: 'sys',
        time: '',
        content: content
    }
}

function UserMsgClass(content) {

    return {
        id: Date.now(),
        role: 'user',
        time: '',
        content: content
    }
}

const appConfig = {
    evaluator_prompt: `# Role: An expert for vtk.js and web-based scientific visualization
# Ground truth: [GROUND_TRUTH]
# Generated code: [GENERATED_CODE]
The ground truth code is provided by [Ground truth], please give a score for [Generated code] according to its readability and correctness. The score is between 0 to 1, and explain reasons for giving this score.
### Response Format
\`\`\`
<Score>[SCORE]</Score>
<Explanation>[EXPLANATION]</Explanation>
### Response Example
<Score>0.8</Score>
<Explanation>The generated code is readable and correct.</Explanation> `,
    eval_user: 'test',
    generator_prompt: `Please use vtkjs to generate visualization code. The code should be in the form of a complete code wrapped only in HTML tags. Please add your thinking process as comments in the code to make it easier to understand the code logic.

In the code, use \`<script src="https://unpkg.com/vtk.js"></script>\` as the library for visualization to implement the visualization function.
Please follow the following rules:
1. The content of the answer is HTML code with vtkjs script(start from <!DOCTYPE html>), and if there is any explanation, it should be given in the form of comments.
2. If the sample code is relevant to the user's requirements, implement the user's requirements based on the sample code.
3. The answer should be based on the provided sample information, and do not fabricate functions that do not exist. 
Please implement the code strictly according to the specific requirements of the user in the \`<QUESTION></QUESTION>\` tag. Ensure that the code logic is clear and straightforward, and generate the visualization-related code completely in accordance with the syntax specifications of vtkjs. 
<QUESTION>__QUESTION__</QUESTION>

`,
    testDes: 'please input prompt',
    testCode: 'please input ground truth',
    models: ['deepseek-v3', 'deepseek-r1', 'deepseek-r1-distill-qwen-32b', 'llama3.2-1b']
}

export { SysMsgClass, UserMsgClass, MSG_LIST, appConfig }



