export class regularOctahedron {
    constructor(gl, options = {}) {
        this.gl = gl;
        
        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // 정팔면체 정점 (중심 원점 기준, edge 길이 1)
        const len = 1 / Math.sqrt(2);  // 높이 조정값
        const nor = 1 / Math.sqrt(3);

        this.vertices = new Float32Array([
            // 중간 사각형 (XZ plane)
            len, 0, 0,      0, len, 0,      0, 0, len,  // top right front
            -len, 0, 0,     0, len, 0,      0, 0, len,  // top left front
            -len, 0, 0,     0, -len, 0,     0, 0, len,  // bottom left front
            len, 0, 0,      0, -len, 0,     0, 0, len,  // bottom right front
            len, 0, 0,      0, len, 0,      0, 0, -len,  // top right back
            -len, 0, 0,     0, len, 0,      0, 0, -len,  // top left back
            -len, 0, 0,     0, -len, 0,     0, 0, -len,  // bottom left back
            len, 0, 0,      0, -len, 0,     0, 0, -len,  // bottom right back
        ]);

        this.normals = new Float32Array([
            nor, nor, nor,   nor, nor, nor,   nor, nor, nor,
            -nor, nor, nor,   -nor, nor, nor,   -nor, nor, nor,
            -nor, -nor, nor,   -nor, -nor, nor,   -nor, -nor, nor,
            nor, -nor, nor,   nor, -nor, nor,   nor, -nor, nor,
            nor, nor, -nor,   nor, nor, -nor,   nor, nor, -nor,
            -nor, nor, -nor,   -nor, nor, -nor,   -nor, nor, -nor,
            -nor, -nor, -nor,   -nor, -nor, -nor,   -nor, -nor, -nor,
            nor, -nor, -nor,   nor, -nor, -nor,   nor, -nor, -nor,
        ]);

        this.texCoords = new Float32Array([
            0.75, 0.5,       0.5, 1,    0.5, 0.5,  // top right front
            0.25, 0.5,       0.5, 1,    0.5, 0.5,  // top left front
            0.25, 0.5,       0.5, 0,    0.5, 0.5,  // bottom left front
            0.75, 0.5,       0.5, 0,    0.5, 0.5,  // bottom right front
            0.75, 0.5,       0.5, 1,    1, 0.5,  // top right back
            0.25, 0.5,       0.5, 1,    0, 0.5,  // top left back
            0.25, 0.5,       0.5, 0,    0, 0.5,  // bottom left back
            0.75, 0.5,       0.5, 0,    1, 0.5,  // bottom right back
        ]);

        this.indices = new Uint16Array([
            0, 1, 2, // top right front
            3, 4, 5,  // top left front
            6, 7, 8,  // bottom left front
            9, 10, 11,  // bottom right front
            12, 13, 14,  // top right back
            15, 16, 17,  // top left back
            18, 19, 20,  // bottom left back
            21, 22, 23   // bottom right back
        ]);

        this.sameVertices = new Uint16Array([
            0, 9, 12, 21,   // indices of the same vertices as v0
            3, 6, 15, 18,  // indices of the same vertices as v1
            2, 5, 8, 11,  // indices of the same vertices as v2
            14, 17, 20, 23,   // indices of the same vertices as v3
            1, 4, 16, 19,  // indices of the same vertices as v4
            7, 10, 19, 22,   // indices of the same vertices as v5
        ]);

        // if color is provided, set all vertices' color to the given color
        if (options.color) {
            for (let i = 0; i < 24 * 4; i += 4) {
                this.colors[i] = options.color[0];
                this.colors[i+1] = options.color[1];
                this.colors[i+2] = options.color[2];
                this.colors[i+3] = options.color[3];
            }
        }
        else {
            this.colors = new Float32Array([
                // front face (v0,v1,v2,v3) - red
                1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
                // right face (v0,v3,v4,v5) - yellow
                1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,
                // top face (v0,v5,v6,v1) - green
                0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,
                // left face (v1,v6,v7,v2) - cyan
                0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,
                // bottom face (v7,v4,v3,v2) - blue
                0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,
                // back face (v4,v7,v6,v5) - magenta
                1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1
            ]);
        }

        this.vertexNormals = new Float32Array(72);
        this.faceNormals = new Float32Array(72);
        this.faceNormals.set(this.normals);

        // compute vertex normals (by averaging face normals)

        for (let i = 0; i < 24; i += 3) {

            let vn_x = (this.normals[this.sameVertices[i]*3] + 
                       this.normals[this.sameVertices[i+1]*3] + 
                       this.normals[this.sameVertices[i+2]*3]) / 3; 
            let vn_y = (this.normals[this.sameVertices[i]*3 + 1] + 
                       this.normals[this.sameVertices[i+1]*3 + 1] + 
                       this.normals[this.sameVertices[i+2]*3 + 1]) / 3; 
            let vn_z = (this.normals[this.sameVertices[i]*3 + 2] + 
                       this.normals[this.sameVertices[i+1]*3 + 2] + 
                       this.normals[this.sameVertices[i+2]*3 + 2]) / 3; 

            this.vertexNormals[this.sameVertices[i]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i+1]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i+2]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i+1]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i+2]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i]*3 + 2] = vn_z;
            this.vertexNormals[this.sameVertices[i+1]*3 + 2] = vn_z;
            this.vertexNormals[this.sameVertices[i+2]*3 + 2] = vn_z;
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
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); // position
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize); // normal
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize); // color
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize); // texCoord

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}
