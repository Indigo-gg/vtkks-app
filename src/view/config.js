//定义存储的消息结构

const MSG_LIST='app-msgList'

function SysMsgClass(content){

    return{
        id:Date.now(),
        role:'sys',
        time:'',
        content:content
    }
}

function UserMsgClass(content){

    return{
        id:Date.now(),
        role:'user',
        time:'',
        content:content
    }
}

const appConfig= {
    evaluator_prompt:   `# Role: An expert for vtk.js and web-based scientific visualization
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
    testDes:'Using sphere source to create shpere data sets and then using the vtkSphereMapper to create a mapper and then render the data.',
    testCode:`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
</head>
<body>
    <div id="renderer"></div>
    <script src="https://unpkg.com/vtk.js"></script>
    <script>
        const vtkFullScreenRenderWindow = vtk.Rendering.Misc.vtkFullScreenRenderWindow;
        const vtkActor = vtk.Rendering.Core.vtkActor;
        const vtkSphereSource = vtk.Filters.Sources.vtkSphereSource;
        const vtkSphereMapper = vtk.Rendering.Core.vtkSphereMapper;
        //if we just use the vtkMapper, the results are volume rendering results
        
        //creating rendering window
        const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({ background: [0, 0, 0] });
        const renderer = fullScreenRenderer.getRenderer();
        const renderWindow = fullScreenRenderer.getRenderWindow();
        const mapper = vtkSphereMapper.newInstance();
        const actor = vtkActor.newInstance();
        
        //creating sphereSource properties
        //default parameter will be used if we do not configure sphere sources    
        const sphereSource = vtkSphereSource.newInstance();

        // adding parameters to mapper
        // actor.setRadius(0.1);
        mapper.setInputConnection(sphereSource.getOutputPort());

        // adding sphere mapper to render window
        actor.setMapper(mapper);
        renderer.addActor(actor);
        renderer.resetCamera();
        renderWindow.render();
    </script>
</body>
</html>`,
    models:['deepseek-v3', 'deepseek-r1']
}

export {SysMsgClass,UserMsgClass,MSG_LIST,appConfig}



