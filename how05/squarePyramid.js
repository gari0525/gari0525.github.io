//squarePyramid 클래스

export class squarePyramid {
    constructor(gl, options = {}) {
        this.gl = gl;
        
        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // Initializing data
        this.vertices = new Float32Array([
            // bottom face (2 triangles)
            -0.5, 0.0, -0.5,   // 0
             0.5, 0.0, -0.5,   // 1
             0.5, 0.0,  0.5,   // 2
            -0.5, 0.0, -0.5,   // 3
             0.5, 0.0,  0.5,   // 4
            -0.5, 0.0,  0.5,   // 5

            // front face
            -0.5, 0.0, -0.5,   // 6
             0.5, 0.0, -0.5,   // 7
             0.0, 1.0,  0.0,   // 8

            // right face
             0.5, 0.0, -0.5,   // 9
             0.5, 0.0,  0.5,   // 10
             0.0, 1.0,  0.0,   // 11

            // back face
             0.5, 0.0,  0.5,   // 12
            -0.5, 0.0,  0.5,   // 13
             0.0, 1.0,  0.0,   // 14

            // left face
            -0.5, 0.0,  0.5,   // 15
            -0.5, 0.0, -0.5,   // 16
             0.0, 1.0,  0.0    // 17
        ]);

        this.normals = new Float32Array([
             // bottom face
             0, -1, 0,  0, -1, 0,  0, -1, 0,
             0, -1, 0,  0, -1, 0,  0, -1, 0,
             // front face
             0, 0.5, -1,  0, 0.5, -1,  0, 0.5, -1,
             // right face
             1, 0.5, 0,   1, 0.5, 0,   1, 0.5, 0,
             // back face
             0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,
             // left face
             -1, 0.5, 0,  -1, 0.5, 0,  -1, 0.5, 0
        ]);

        this.colors = new Float32Array([
            // Bottom face (6 정점) - 파랑
            0, 0, 1, 1,  0, 0, 1, 1,  0, 0, 1, 1,
            0, 0, 1, 1,  0, 0, 1, 1,  0, 0, 1, 1,
            // Front face - 빨강
            1, 0, 0, 1,  1, 0, 0, 1,  1, 0, 0, 1,
            // Right face - 노랑
            1, 1, 0, 1,  1, 1, 0, 1,  1, 1, 0, 1,
            // Back face - 보라
            1, 0, 1, 1,  1, 0, 1, 1,  1, 0, 1, 1,
            // Left face - 청록
            0, 1, 1, 1,  0, 1, 1, 1,  0, 1, 1, 1
        ]);

        this.indices = new Uint16Array([
             // bottom face
             0, 1, 2,
             3, 4, 5,
             // front
             6, 7, 8,
             // right
             9, 10, 11,
             // back
             12, 13, 14,
             // left
             15, 16, 17
        ]);

        this.vertexNormals = new Float32Array(72);
        this.faceNormals = new Float32Array(72);
        this.faceNormals.set(this.normals);


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

        // 버퍼 크기 계산
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const totalSize = vSize + nSize + cSize;

        gl.bindVertexArray(this.vao);

        // VBO에 데이터 복사
        // gl.bufferSubData(target, offset, data): target buffer의 
        //     offset 위치부터 data를 copy (즉, data를 buffer의 일부에만 copy)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);

        // EBO에 인덱스 데이터 복사
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // vertex attributes 설정
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // position
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);  // normal
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);  // color

        // vertex attributes 활성화
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);

        // 버퍼 바인딩 해제
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
        this.indexCount = this.indices.length;
    }


    draw(shader) {

        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
} 