// homework2.js
import { resizeAspectRatio, setupText, updateText } from './util/util.js';
import { Shader, readShaderFile } from './util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

let shader;
let vao;
let offset = { x: 0, y: 0 };

// ===[ A. 키 상태 테이블 + keydown/keyup 이벤트 ]===
const keys = { ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false };
const STEP = 0.01;

function setupKeyboardEvents() {
  window.addEventListener('keydown', (e) => {
    if (e.key in keys) {
      keys[e.key] = true;
      e.preventDefault(); // 화살표 기본 스크롤 방지
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.key in keys) {
      keys[e.key] = false;
      e.preventDefault();
    }
  });
}
// ===[ A 끝 ]===

function initWebGL() {
  if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
    return false;
  }

  canvas.width = 600;
  canvas.height = 600;

  resizeAspectRatio(gl, canvas);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);;
  return true;
}

async function initShader() {
  const vertexShaderSource = await readShaderFile('shader.vert');
  const fragmentShaderSource = await readShaderFile('shader.frag');
  shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function setupBuffers() {
  const vertices = new Float32Array([
    -0.1, -0.1, 0.0, // 좌하
     0.1, -0.1, 0.0, // 우하
     0.1,  0.1, 0.0, // 우상
    -0.1,  0.1, 0.0  // 좌상
  ]);

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  shader.setAttribPointer('aPos', 3, gl.FLOAT, false, 0, 0);
}

// ===[ B. render에서 매 프레임 이동 적용 ]===
const HALF = 0.1;                 // 사각형 반쪽 크기
const LIMIT = 1.0 - HALF;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function render() {
  // 키 상태 기반으로 오프셋 갱신
  if (keys.ArrowLeft)  offset.x -= STEP;
  if (keys.ArrowRight) offset.x += STEP;
  if (keys.ArrowUp)    offset.y += STEP;
  if (keys.ArrowDown)  offset.y -= STEP;

  offset.x = clamp(offset.x, -LIMIT, LIMIT);
  offset.y = clamp(offset.y, -LIMIT, LIMIT);

  gl.clear(gl.COLOR_BUFFER_BIT);

  shader.setVec4('uColor', [1.0, 0.0, 0.0, 1.0]);
  shader.setVec2('uOffset', [offset.x, offset.y]); // 매 프레임 전달

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  requestAnimationFrame(render);
}
// ===[ B 끝 ]===

async function main() {
  try {
    if (!initWebGL()) {
      throw new Error('WebGL 초기화 실패');
    }

    await initShader();

    setupText(canvas, 'Use arrow keys to move the rectangle', 1);

    setupKeyboardEvents();   // A: 키 이벤트 등록
    setupBuffers();
    shader.use();

    render();                // B: 매 프레임 이동 적용된 렌더링 시작
    return true;
  } catch (error) {
    console.error('Failed to initialize program:', error);
    alert('프로그램 초기화에 실패했습니다.');
    return false;
  }
}

main().then(success => {
  if (!success) {
    console.log('프로그램을 종료합니다.');
    return;
  }
}).catch(error => {
  console.error('프로그램 실행 중 오류 발생:', error);
});
