"use strict";

const vertexShader = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    
    varying lowp vec4 vColor;
    
    void main() {
      gl_Position = aVertexPosition;
      
      vColor = aVertexColor;
    }
`;

const fragmentShader = `
    varying lowp vec4 vColor;
    
    void main() {
      gl_FragColor = vColor;
    }
`;

const squareColor = [0.2, 0.5, 0.5, 0];

document.addEventListener('DOMContentLoaded', function (event) {
    const canvas = document.querySelector("#background");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const gl = canvas.getContext("webgl", {
        premultipliedAlpha: false
    });

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    const shaderProgram = initShaderProgram(gl, vertexShader, fragmentShader);
    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    connectPointers(gl, shaderProgram, positionBuffer, colorBuffer);

    const squares = new Squares();

    animate(function (elapsed) {
        drawScene(elapsed, gl, squares, positionBuffer, colorBuffer);
    });
});

function animate(func) {
    let start;

    const newFunc = function (timestamp) {
        if (start === undefined)
            start = timestamp;

        const elapsed = timestamp - start;

        start = timestamp;

        func(elapsed);
        window.requestAnimationFrame(newFunc);
    }

    window.requestAnimationFrame(newFunc);
}

const addTime = 2500;
const removeTime = 3500;

class Square {
    constructor(vertices, color) {
        this.vertices = vertices;
        this.color = color;
        this.adding = true;
        this.totalElapsed = 0;
    }

    tick(elapsed) {
        this.totalElapsed += elapsed;

        switch (this.adding) {
            case true:
                if (this.color[3] >= 1) {
                    this.adding = false;
                    this.totalElapsed = 0;
                    return false;
                }

                this.color[3] = this.totalElapsed / addTime;


                return false;
            case false:
                this.color[3] = (removeTime - this.totalElapsed) / removeTime;

                return this.color[3] < 0;
        }
    }
}

const squareAddTime = 3000;

class Squares {
    constructor() {
        this.squares = [];
        this.totalElapsed = squareAddTime;
    }

    new(aspectRatio) {
        const stepX = (1 / 5) * (aspectRatio);
        const sizeX = stepX / 2;
        const stepY = (1 / 5);
        const sizeY = stepY / 2;

        let totalXSquares = Math.ceil(2 / stepX);

        const rightMostSquareLeft = -1 + (totalXSquares - 1) * stepX;

        if (rightMostSquareLeft < 1 && rightMostSquareLeft + sizeX > 1) {
            totalXSquares -= 1;
        }

        const xOffset = (1 - (-1 + (totalXSquares - 1) * stepX + sizeX)) / 2;

        const chosenX = Math.floor(Math.random() * totalXSquares);

        const maxY = (1 - (-1 - sizeY / 2)) / stepY;
        const chosenY = Math.floor(Math.random() * maxY);

        const x = -1 + xOffset + chosenX * stepX;
        const y = (-1 - sizeY / 2) + chosenY * stepY;

        this.squares.push(new Square([
            x, y,
            x + sizeX, y,
            x, y - sizeY,
            x, y - sizeY,
            x + sizeX, y,
            x + sizeX, y - sizeY,
        ], [...squareColor]));
    }

    tick(elapsed, aspectRatio) {
        this.totalElapsed += elapsed;

        if (this.totalElapsed >= squareAddTime) {
            this.new(aspectRatio);
            this.totalElapsed = 0;
        }

        for (let i = 0; i < this.squares.length; i += 1) {
            if (this.squares[i].tick(elapsed)) {
                this.squares.splice(i, 1);
                i -= 1;
            }
        }
    }

    data() {
        const positions = [];
        const colors = [];

        for (const square of this.squares) {
            positions.push(...square.vertices);
            for (let i = 0; i < square.vertices.length / 2; i += 1) {
                colors.push(...square.color);
            }
        }

        return {
            'positions': positions,
            'colors': colors
        };
    }
}

function drawScene(elapsed, gl, squares, positionBuffer, colorBuffer) {
    squares.tick(elapsed, gl.canvas.clientHeight / gl.canvas.clientWidth);

    const data = squares.data();

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.colors), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.positions), gl.DYNAMIC_DRAW);

    const offset = 0;
    gl.drawArrays(gl.TRIANGLES, offset, data.positions.length / 2);
}

function connectPointers(gl, shaderProgram, positionBuffer, colorBuffer) {
    {
        const vertexPointer = gl.getAttribLocation(shaderProgram, 'aVertexPosition');

        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(
            vertexPointer,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(vertexPointer);
    }

    {
        const colorPointer = gl.getAttribLocation(shaderProgram, 'aVertexColor');

        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(
            colorPointer,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(colorPointer);
    }

    gl.useProgram(shaderProgram);
}

function initShaderProgram(gl, vertexShader, fragmentShader) {
    const vertexShaderCompiled = loadShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragmentShaderCompiled = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShaderCompiled);
    gl.attachShader(shaderProgram, fragmentShaderCompiled);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}