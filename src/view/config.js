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
    testDes: 'create an interactive webpage for exploring various 3D geometric shapes with customizable properties and responsive design using vtk.js library',
    testCode: `
<\!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>vtk.js Many Renderers</title>
</head>

<body>
    <div id="renderer"></div>

    <script type="text/javascript" src="https://unpkg.com/@babel/polyfill@7.0.0/dist/polyfill.js"></script>

    <script src="https://unpkg.com/vtk.js"></script>

    <script>
        // 假设vtk.js已经通过某种方式被加载到全局变量vtk中
        // 例如，通过<script>标签在HTML中引入vtk.js，或者通过模块加载器

        // 使用vtk命名空间来引用各个类
        const vtkActor = vtk.Rendering.Core.vtkActor;
        const vtkConeSource = vtk.Filters.Sources.vtkConeSource;
        const vtkSphereSource = vtk.Filters.Sources.vtkSphereSource;
        const vtkCubeSource = vtk.Filters.Sources.vtkCubeSource;
        const vtkCylinderSource = vtk.Filters.Sources.vtkCylinderSource;
        const vtkMapper = vtk.Rendering.Core.vtkMapper;
        const vtkRenderWindow = vtk.Rendering.Core.vtkRenderWindow;
        const vtkRenderWindowInteractor = vtk.Rendering.Core.vtkRenderWindowInteractor;
        const vtkRenderer = vtk.Rendering.Core.vtkRenderer;
        const vtkInteractorStyleTrackballCamera = vtk.Interaction.Style.vtkInteractorStyleTrackballCamera;

        // ----------------------------------------------------------------------------
        // Meshes

        //  ------------------------------------------------------------
        // Meshes
        // ----------------------------------------------------------------------------

        const meshes = [];

        function addMesh(name, source) {
            const mapper = vtkMapper.newInstance();
            mapper.setInputData(source.getOutputData());
            meshes.push({ name, mapper });
        }

        addMesh('Cone', vtkConeSource.newInstance());
        addMesh('Sphere', vtkSphereSource.newInstance());
        addMesh('Cube', vtkCubeSource.newInstance());
        addMesh('Cylinder', vtkCylinderSource.newInstance());

        // ----------------------------------------------------------------------------
        // Properties
        // ----------------------------------------------------------------------------

        const properties = [
            {
                name: '- Red',
                properties: { color: [1, 0.6, 0.6] },
            },
            {
                name: 'Edge - Red',
                properties: { edgeVisibility: true, color: [1, 0.6, 0.6] },
            },
            {
                name: '- Blue',
                properties: { color: [0.6, 0.6, 1] },
            },
            {
                name: 'Edge - Green',
                properties: { edgeVisibility: true, color: [0.6, 1, 0.6] },
            },
            {
                name: '- Green',
                properties: { color: [0.6, 1, 0.6] },
            },
            {
                name: 'Edge - Blue',
                properties: { edgeVisibility: true, color: [0.6, 0.6, 1] },
            },
        ];

        // ----------------------------------------------------------------------------
        // Background colors
        // ----------------------------------------------------------------------------

        const colors = [
            [0.2, 0.2, 0.2],
            [0.4, 0.2, 0.3],
            [0.2, 0.4, 0.3],
            [0.6, 0.6, 0.6],
            [0.2, 0.4, 0.4],
            [0.3, 0.4, 0.2],
            [0.3, 0.2, 0.4],
        ];

        // ----------------------------------------------------------------------------
        // Single RenderWindow in fullscreen
        // ----------------------------------------------------------------------------

        const RENDERERS = {};

        const renderWindow = vtkRenderWindow.newInstance();
        const renderWindowView = renderWindow.newAPISpecificView();
        renderWindow.addView(renderWindowView);

        const rootContainer = document.createElement('div');
        rootContainer.style.position = 'fixed';
        rootContainer.style.zIndex = -1;
        rootContainer.style.left = 0;
        rootContainer.style.top = 0;
        rootContainer.style.pointerEvents = 'none';
        document.body.appendChild(rootContainer);

        renderWindowView.setContainer(rootContainer);

        const interactor = vtkRenderWindowInteractor.newInstance();
        interactor.setView(renderWindowView);
        interactor.initialize();
        interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());

        function updateViewPort(element, renderer) {
            const { innerHeight, innerWidth } = window;
            const { x, y, width, height } = element.getBoundingClientRect();
            const viewport = [
                x / innerWidth,
                1 - (y + height) / innerHeight,
                (x + width) / innerWidth,
                1 - y / innerHeight,
            ];
            renderer.setViewport(...viewport);
        }

        function recomputeViewports() {
            const rendererElems = document.querySelectorAll('.renderer');
            for (let i = 0; i < rendererElems.length; i++) {
                const elem = rendererElems[i];
                const { id } = elem;
                const renderer = RENDERERS[id];
                updateViewPort(elem, renderer);
            }
            renderWindow.render();
        }

        function resize() {
            rootContainer.style.width = \`${window.innerWidth}px\`;
            renderWindowView.setSize(window.innerWidth, window.innerHeight);
            recomputeViewports();
        }

        new ResizeObserver(resize).observe(document.body);
        document.addEventListener('scroll', recomputeViewports);

        // ----------------------------------------------------------------------------
        // Renderers
        // ----------------------------------------------------------------------------

        let meshIndex = 0;
        let propertyIndex = 0;
        let bgIndex = 0;
        let rendererId = 1;

        function applyStyle(element) {
            element.classList.add('renderer');
            element.style.width = '200px';
            element.style.height = '200px';
            element.style.margin = '20px';
            element.style.border = 'solid 1px #333';
            element.style.display = 'inline-block';
            element.style.boxSizing = 'border';
            element.style.textAlign = 'center';
            element.style.color = 'white';
            return element;
        }

        let captureCurrentRenderer = false;

        function setCaptureCurrentRenderer(yn) {
            captureCurrentRenderer = yn;
            if (yn && interactor.getCurrentRenderer()) {
                // fix the current renderer to, well, the current renderer
                interactor.setCurrentRenderer(interactor.getCurrentRenderer());
            } else {
                // remove the fixed current renderer
                interactor.setCurrentRenderer(null);
            }
        }

        function bindInteractor(renderer, el) {
            // only change the interactor's container if needed
            if (interactor.getContainer() !== el) {
                if (interactor.getContainer()) {
                    interactor.unbindEvents();
                }
                if (captureCurrentRenderer) {
                    interactor.setCurrentRenderer(renderer);
                }
                if (el) {
                    interactor.bindEvents(el);
                }
            }
        }

        function addRenderer() {
            const mesh = meshes[meshIndex];
            const prop = properties[propertyIndex];
            const background = colors[bgIndex];
            meshIndex = (meshIndex + 1) % meshes.length;
            propertyIndex = (propertyIndex + 1) % properties.length;
            bgIndex = (bgIndex + 1) % colors.length;

            const container = applyStyle(document.createElement('div'));
            container.id = rendererId++;
            document.body.appendChild(container);

            const actor = vtkActor.newInstance();
            actor.setMapper(mesh.mapper);
            actor.getProperty().set(prop.properties);
            actor.getProperty().setDiffuse(0.9);
            actor.getProperty().setSpecular(0.2);
            actor.getProperty().setSpecularPower(30);
            actor.getProperty().setSpecularColor(1.0, 1.0, 1.0);
            const renderer = vtkRenderer.newInstance({ background });
            container.innerHTML = \`\${mesh.name} \${prop.name}\`;

            container.addEventListener('pointerenter', () =>
                bindInteractor(renderer, container)
            );
            container.addEventListener('pointerleave', () => bindInteractor(null, null));

            renderer.addActor(actor);
            renderWindow.addRenderer(renderer);
            updateViewPort(container, renderer);
            renderer.resetCamera();

            // Keep track of renderer
            RENDERERS[container.id] = renderer;
        }

        // ----------------------------------------------------------------------------
        // Fill up page
        // ----------------------------------------------------------------------------

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'singleRendererCapture';
        const label = document.createElement('label');
        label.for = checkbox.name;
        label.innerText = 'Enable single renderer capture';

        checkbox.addEventListener('input', (ev) => {
            setCaptureCurrentRenderer(ev.target.checked);
        });

        document.body.appendChild(checkbox);
        document.body.appendChild(label);
        document.body.appendChild(document.createElement('br'));

        for (let i = 0; i < 64; i++) {
            addRenderer();
        }
        resize();

        function updateCamera(renderer) {
            const camera = renderer.getActiveCamera();
            camera.azimuth(0.5);
            renderer.resetCameraClippingRange();
        }

        function animate() {
            Object.values(RENDERERS).forEach(updateCamera);
            renderWindow.render();
            window.requestAnimationFrame(animate);
        }

        window.requestAnimationFrame(animate);

        // ----------------------------------------------------------------------------
        // Globals
        // ----------------------------------------------------------------------------

        window.rw = renderWindow;
        window.glrw = renderWindowView;
        window.renderers = RENDERERS;



    </script>

</body>

</html>`,
    testGeneratedCode: `<!DOCTYPE html>
<html>
<head>
    <title>Cellular VR Experience</title>
    <script src="https://unpkg.com/vtk.js"></script>
    <style>
        /* Basic styling for the visualization container */
        #vtkContainer {
            width: 100%;
            height: 100vh;
            background-color: #000;
        }
        
        /* Style for the control panel */
        .control-panel {
            position: fixed;
            top: 10px;
            left: 10px;
            background-color: rgba(255, 255, 255, 0.8);
            padding: 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div id="vtkContainer"></div>
    <div class="control-panel">
        <h3>Simulation Controls</h3>
        <button id="startSimulation">Start Simulation</button>
        <button id="reset">Reset</button>
    </div>

    <script>
        // Initialize VTK.js
        vtk.init().then(() => {
            // Create a renderer and render window
            const renderer = vtk.Renderer.newInstance();
            const renderWindow = vtkRenderWindow.newInstance();
            renderWindow.addView(renderer);

            // Set up the camera
            const camera = vtk.Camera.newInstance();
            camera.setPosition(0, 0, 10);
            camera.setViewAngle(30);
            renderer.setActiveCamera(camera);

            // Add lighting
            const ambientLight = vtk.AmbientLight.newInstance();
            ambientLight.setColor([0.5, 0.5, 0.5]);
            renderer.addLight(ambientLight);

            const pointLight = vtk.PointLight.newInstance();
            pointLight.setPosition(10, 10, 10);
            pointLight.setColor([1, 1, 1]);
            renderer.addLight(pointLight);

            // Create the cell structure
            // (This would be replaced with actual cell model data)
            const cellGeometry = createCellGeometry();
            const cellActor = createCellActor(cellGeometry);
            renderer.addActor(cellActor);

            // Add interactor for rotation and zoom
            const interactor = vtk.InteractorStyleTrackballCamera.newInstance();
            renderWindow.setInteractor(interactor);

            // Add event handlers for user interaction
            interactor.onButtonDown((e) => {
                // Handle mouse/touch events for rotation and zoom
            });

            // Start the rendering loop
            renderWindow.render();
        });

        // Function to create cell geometry
        function createCellGeometry() {
            // Create a simple sphere for the cell
            const sphere = vtk.SphereSource.newInstance({
                radius: 5,
                phiResolution: 30,
                thetaResolution: 30
            });
            return sphere;
        }

        // Function to create cell actor
        function createCellActor(geometry) {
            const mapper = vtk.Glyph3DMapper.newInstance();
            const actor = vtk.Actor.newInstance();
            mapper.setInputConnection(geometry.getOutputPort());
            actor.setMapper(mapper);
            actor.setColor(0.9, 0.9, 0.9); // Light gray for the cell membrane
            return actor;
        }

        // Function to add molecular structures
        function addMolecularStructures() {
            // Add molecular structures (simplified example)
            const moleculeGeometry = vtk.SphereSource.newInstance({
                radius: 0.5,
                phiResolution: 20,
                thetaResolution: 20
            });

            const moleculeActor = createCellActor(moleculeGeometry);
            moleculeActor.setColor(1, 0, 0); // Red for molecules
            render.addActor(moleculeActor);
        }
            console.log('heloollll!!!')

        // Function to simulate treatment effects
        function simulateTreatment() {
            // Add treatment simulation logic
            console.log('Simulating treatment effects...');
        }

        // Event listeners for control panel
        document.getElementById('startSimulation').addEventListener('click', simulateTreatment);
        document.getElementById('reset').addEventListener('click', () => {
            // Reset simulation
            console.log('Resetting simulation...');
        });
    </script>
</body>
</html>:`,
    models: ['deepseek-v3', 'deepseek-r1', 'deepseek-r1-distill-qwen-32b']
}

export { SysMsgClass, UserMsgClass, MSG_LIST, appConfig }



