/*-------------------------------------------------------------------------
08_Transformation.js

canvas의 중심에 한 edge의 길이가 0.3인 정사각형을 그리고, 
이를 크기 변환 (scaling), 회전 (rotation), 이동 (translation) 하는 예제임.
    T는 x, y 방향 모두 +0.5 만큼 translation
    R은 원점을 중심으로 2초당 1회전의 속도로 rotate
    S는 x, y 방향 모두 0.3배로 scale
이라 할 때, 
    keyboard 1은 TRS 순서로 적용
    keyboard 2는 TSR 순서로 적용
    keyboard 3은 RTS 순서로 적용
    keyboard 4는 RST 순서로 적용
    keyboard 5는 STR 순서로 적용
    keyboard 6은 SRT 순서로 적용
    keyboard 7은 원래 위치로 돌아옴
---------------------------------------------------------------------------*/
import { resizeAspectRatio, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let vao;
let axes;
let finalTransform;
let lastTime = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
        requestAnimationFrame(animate);
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    
    return true;
}

function setupBuffers() {
    const cubeVertices = new Float32Array([
        -0.5,  0.5,  // 좌상단
        -0.5, -0.5,  // 좌하단
         0.5, -0.5,  // 우하단
         0.5,  0.5   // 우상단
    ]);

    const indices = new Uint16Array([
        0, 1, 2,    // 첫 번째 삼각형
        0, 2, 3     // 두 번째 삼각형
    ]);

    const cubeColors = new Float32Array([
        1.0, 0.0, 0.0, 1.0,  // 빨간색
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0
    ]);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // VBO for position
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    // VBO for color
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);
    shader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

    // EBO
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
}

let angle1 = 0, angle2 = 0, angle3 = 0;

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // draw axes
    axes.draw(mat4.create(), mat4.create()); 

    shader.use();
    gl.bindVertexArray(vao);

    // 첫 번째 객체 (중심, 자전만, 빨간색)
    let model1 = mat4.create();
    mat4.rotateZ(model1, model1, angle1);
    mat4.scale(model1, model1, [0.2, 0.2, 1]);
    shader.setVec4("a_color", [1.0, 0.0, 0.0, 1.0]);
    shader.setMat4("u_transform", model1);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    // 두 번째 객체 (첫 번째 객체 기준 공전 + 자전, 보라색)
    let model2 = mat4.create();
    mat4.rotateZ(model2, model2, angle2); // 공전
    mat4.translate(model2, model2, [0.7, 0.0, 0.0]);
    mat4.rotateZ(model2, model2, angle3); // 자전
    mat4.scale(model2, model2, [0.1, 0.1, 1]);
    shader.setVec4("a_color", [1.0, 0.0, 1.0, 1.0]);
    shader.setMat4("u_transform", model2);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    // 세 번째 객체 (두 번째 객체 기준 공전 + 자전, 파란색)
    let model3 = mat4.create();
    mat4.rotateZ(model3, model3, angle2); // 2번의 공전 위치로 이동
    mat4.translate(model3, model3, [0.7, 0.0, 0.0]);
    mat4.rotateZ(model3, model3, angle3); // 2번 자전 위치로 이동
    mat4.translate(model3, model3, [0.2, 0.0, 0.0]); // 3번 공전
    mat4.rotateZ(model3, model3, angle3 * 2); // 3번 자전
    mat4.scale(model3, model3, [0.05, 0.05, 1]);
    shader.setVec4("a_color", [0.0, 0.0, 1.0, 1.0]);
    shader.setMat4("u_transform", model3);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    angle1 += (Math.PI / 4) * deltaTime; // 45 deg/sec
    angle2 += (Math.PI / 6) * deltaTime; // 30 deg/sec (2번 공전)
    angle3 += (Math.PI) * deltaTime;     // 180 deg/sec (2,3번 자전)

    render();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);


async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        finalTransform = mat4.create();
        
        await initShader();

        setupBuffers();
        axes = new Axes(gl, 0.8);

        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}