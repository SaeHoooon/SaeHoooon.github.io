import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let vao;
let finalTransform;
let rotationAngle = 0;
let currentTransformType = null;
let isAnimating = false;
let lastTime = 0;

let angleLong = 0, angleShort = 0;
let startTime = 0;

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
        -0.1,  0.5,  // 좌상단
        -0.1, -0.5,  // 좌하단
         0.1, -0.5,  // 우하단
         0.1,  0.5,  // 우상단
        
        -0.05, 0.8,  // 좌상단
        -0.05, 0.2,  // 좌하단
         0.05, 0.2,  // 우하단
         0.05, 0.8,  // 우상단

        -0.025, 0.9,  
        -0.025, 0.7, 
         0.025, 0.7,  
         0.025, 0.9,

         -0.025, 0.3,  
        -0.025, 0.1, 
         0.025, 0.1,  
         0.025, 0.3,
    ]);

    const indices = new Uint16Array([
        0, 1, 2,    // 기둥
        0, 2, 3,    

        4, 5, 6,    // 큰 날개
        4, 6 , 7,

        8, 9, 10,   // 작은 날개
        8, 10, 11,

        12, 13, 14,   // 작은 날개
        12, 14, 15,

    ]);

    const cubeColors = new Float32Array([
        0.65, 0.35, 0.0, 1.0,  // 갈색
        0.65, 0.35, 0.0, 1.0,
        0.65, 0.35, 0.0, 1.0,
        0.65, 0.35, 0.0, 1.0,

        0.0, 0.0, 0.0, 0.0,    // 흰색
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,

        0.33,0.33,0.33,0.7,     // 회색
        0.33,0.33,0.33,0.7,  
        0.33,0.33,0.33,0.7,  
        0.33,0.33,0.33,0.7,  

        0.33,0.33,0.33,0.7,     // 회색
        0.33,0.33,0.33,0.7,  
        0.33,0.33,0.33,0.7,  
        0.33,0.33,0.33,0.7,  
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


//(cx, cy) 기준 회전 
function pivotRotate(cx, cy, theta) {
  const T = mat4.create(), R = mat4.create(), Tinv = mat4.create(), M = mat4.create();
  mat4.fromTranslation(T, [cx, cy, 0]);
  mat4.fromRotation(R, theta, [0, 0, 1]);     
  mat4.fromTranslation(Tinv, [-cx, -cy, 0]);
  mat4.multiply(M, T, R);
  mat4.multiply(M, M, Tinv);
  return M;
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  shader.use();
  gl.bindVertexArray(vao);

  // 기둥
  shader.setMat4("u_transform", mat4.create());
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); 

  // 2) 큰 날개 
  const Mbig = pivotRotate(0.0, 0.5, angleLong);
  shader.setMat4("u_transform", Mbig);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 6 * 2); 

  // 3) 작은 날개 (위)
  const MsmallTop = mat4.create();
  mat4.multiply(MsmallTop, Mbig, pivotRotate(0.0, 0.8, angleShort));
  shader.setMat4("u_transform", MsmallTop);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12 * 2); 

  // 4) 작은 날개 (아래)
  const MsmallBot = mat4.create();
  mat4.multiply(MsmallBot, Mbig, pivotRotate(0.0, 0.2, angleShort));
  shader.setMat4("u_transform", MsmallBot);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 18 * 2); 
}

function animate(currentTime) {
  if (!startTime) startTime = currentTime;
  const t = (currentTime - startTime) / 1000;  

  angleLong  = Math.sin(t) * Math.PI * 2.0;       // 큰 날개
  angleShort = Math.sin(t) * Math.PI * (-10.0);   // 작은 날개

  render();
  requestAnimationFrame(animate);
}

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

        return true;

    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}