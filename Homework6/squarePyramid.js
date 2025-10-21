export class squarePyramid {
    constructor(gl, options = {}) {
        this.gl = gl;
        
        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // Initializing data
        this.vertices = new Float32Array([
            // bottom face
            -0.5, 0.0, 0.5,   0.5, 0.0, 0.5,   0.5, 0.0, -0.5,
            -0.5, 0.0, 0.5,  0.5, 0.0, -0.5,  -0.5, 0.0, -0.5,
            // right face  (v0,v3,v4,v5)
            0.0,  1.0,  0.0,  -0.5, 0.0,  0.5,   0.5, 0.0, 0.5,
            // top face    (v0,v5,v6,v1)
            0.0,  1.0,  0.0,   0.5,  0.0, 0.5,  0.5,  0.0, -0.5,
            // left face   (v1,v6,v7,v2)
            0.0,  1.0,  0.0,  0.5,  0.0, -0.5,  -0.5, 0.0, -0.5,
            // bottom face (v7,v4,v3,v2)
            0.0,  1.0,  0.0,   -0.5, 0.0, -0.5,   -0.5, 0.0,  0.5
        ]);

        this.normals = new Float32Array([
            // bottom
            0, -1, 0,   0, -1, 0,   0, -1, 0,
            0, -1, 0,   0, -1, 0,   0, -1, 0,
            // front
            0,  0.707,  0.707,   0,  0.707,  0.707,   0,  0.707,  0.707,
            // right
            0.707,  0.707, 0,   0.707,  0.707, 0,   0.707,  0.707, 0,
            // bottom
            0,  0.707, -0.707,   0,  0.707, -0.707,   0,  0.707, -0.707,
            // left
            -0.707, 0.707, 0,   -0.707, 0.707, 0,   -0.707, 0.707, 0
        ]);

        this.colors = new Float32Array(18 * 4);
        if (options.color) {
            for (let i = 0; i < 18; i++) {
                this.colors.set(options.color, i * 4);
            }
        } else {
            // Default to white so texture color is not affected
            this.colors.fill(1.0);
        }

        this.texCoords = new Float32Array([
            // 바닥면
            0, 1,  1, 1,  1, 0,
            0, 1,  1, 0,  0, 0,
            // 앞면
            0.125, 1.0,   0.0, 0.0,   0.25, 0.0,
            // 오른쪽 면
            0.375, 1.0,   0.25, 0.0,  0.5, 0.0,
            // 뒷면
            0.625, 1.0,   0.5, 0.0,   0.75, 0.0,
            // 왼쪽 면
            0.875, 1.0,   0.75, 0.0,  1.0, 0.0,
    ]);

        this.indices = new Uint16Array([
            // front face
            0, 1, 2,
            0, 2, 3,

            4, 5, 6,
            7, 8, 9,
            10, 11, 12,
            13, 14, 15,
        ]);

        this.sameVertices = new Uint16Array([
            0, 3, 6,       // bottom v0 
            1, 4, 7,       // bottom v1
            2, 5, 8,       // bottom v2
            9, 10, 11,     // peak
            12, 13, 14,    // bottom v3
            15, 16, 17     // 꼭대기 정점 재사용
        ]);

        this.vertexNormals = new Float32Array(18*3);
        this.faceNormals = new Float32Array(18*3);
        this.faceNormals.set(this.normals);

        // compute vertex normals (by averaging face normals)

        for (let i = 0; i < this.sameVertices.length; i += 3) {
            let i0 = this.sameVertices[i];
            let i1 = this.sameVertices[i + 1];
            let i2 = this.sameVertices[i + 2];
        
            let vn_x = (this.normals[i0 * 3] + this.normals[i1 * 3] + this.normals[i2 * 3]) / 3;
            let vn_y = (this.normals[i0 * 3 + 1] + this.normals[i1 * 3 + 1] + this.normals[i2 * 3 + 1]) / 3;
            let vn_z = (this.normals[i0 * 3 + 2] + this.normals[i1 * 3 + 2] + this.normals[i2 * 3 + 2]) / 3;
        
            this.vertexNormals[i0 * 3] = vn_x;
            this.vertexNormals[i1 * 3] = vn_x;
            this.vertexNormals[i2 * 3] = vn_x;
        
            this.vertexNormals[i0 * 3 + 1] = vn_y;
            this.vertexNormals[i1 * 3 + 1] = vn_y;
            this.vertexNormals[i2 * 3 + 1] = vn_y;
        
            this.vertexNormals[i0 * 3 + 2] = vn_z;
            this.vertexNormals[i1 * 3 + 2] = vn_z;
            this.vertexNormals[i2 * 3 + 2] = vn_z;
        }

        this.initBuffers();
    }

    copyVertexNormalsToNormals() {
        this.normals.set(this.vertexNormals);
    }

    copyFaceNormalsToNormals() {
        this.normals.set(this.faceNormals);
    }

    initBuffers() {
        const gl = this.gl;
    
        // Float32Array로 변환
        this.colors = new Float32Array(this.colors);
    
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords ? this.texCoords.byteLength : 0;
        const totalSize = vSize + nSize + cSize + tSize;
    
        gl.bindVertexArray(this.vao);
    
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        if (this.texCoords)
            gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);
    
        
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);                             // position
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);                        // normal
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, vSize + nSize);                // color (3 components)
        if (this.texCoords)
            gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);    // texCoord
    
        
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        if (this.texCoords)
            gl.enableVertexAttribArray(3);
    
        // EBO 설정 (선택 사항: 인덱스를 사용하는 경우에만)
        if (this.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        }
    
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
    
    updateNormals() {
        const gl = this.gl;
        const vSize = this.vertices.byteLength;
    
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
    
    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        
        // gl.drawArrays(mode, first, count)
        gl.drawArrays(gl.TRIANGLES, 0, 18);
        
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
} 