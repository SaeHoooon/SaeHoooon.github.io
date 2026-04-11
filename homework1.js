// Homework01.js
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
if (!gl) {
  console.error('WebGL 2 is not supported by your browser.');
}

canvas.width = 500;
canvas.height = 500;

function render() {
  const W = canvas.width;
  const H = canvas.height;
  const halfW = Math.floor(W / 2);
  const halfH = Math.floor(H / 2);

  gl.viewport(0, 0, W, H);
  gl.enable(gl.SCISSOR_TEST);

  // 좌하 (x=0, y=0)
  gl.scissor(0, 0, halfW, halfH);
  gl.clearColor(1.00, 0, 0, 1.0); 
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 우하 (x=halfW, y=0)
  gl.scissor(halfW, 0, W - halfW, halfH);
  gl.clearColor(0, 0, 1, 1.0); 
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 좌상 (x=0, y=halfH)
  gl.scissor(0, halfH, halfW, H - halfH);
  gl.clearColor(0, 1.0, 0 ,1.0); 
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 우상 (x=halfW, y=halfH)
  gl.scissor(halfW, halfH, W - halfW, H - halfH);
  gl.clearColor(0.95, 0.85, 0.30, 1.0); 
  gl.clear(gl.COLOR_BUFFER_BIT);

  
  gl.disable(gl.SCISSOR_TEST);
}

render();

function resizeToSquare() {
  const size = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = size;
  canvas.height = size;
  render();
}

window.addEventListener('resize', resizeToSquare);