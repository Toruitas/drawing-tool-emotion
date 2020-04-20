import {webglUtils} from "./webgl-utils";

export default class WglRunner{
    constructor(gl, stateToRender={}){
        this.gl = gl;
        this.stateToRender = stateToRender;
        this.vertexShaderSource = `#version 300 es

        // an attribute is an input (in) to a vertex shader.
        // It will receive data from a buffer
        in vec2 a_position;

        // Used to pass in the resolution of the canvas
        uniform vec2 u_resolution;

        // all shaders have a main function
        void main() {

            // convert the position from pixels to 0.0 to 2.0
            vec2 zeroToOne = a_position / u_resolution;

            // convert from 0->1 to 0->2
            vec2 zeroToTwo = zeroToOne * 2.0;

            gl_Position = vec4(zeroToTwo, 0, 1);
        }
        `;

        this.fragmentShaderSource = `#version 300 es

        precision mediump float;

        uniform vec4 u_color;

        // we need to declare an output for the fragment shader
        out vec4 outColor;

        void main() {
            outColor = u_color;
        }
        `;
    }

    renderCanvas(){
        // Lots of this code is adapted from https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html

        // let canvas = document.querySelector(`#${this.id}`);
        let gl = this.gl;

        // Currently we only have 1 program. Future version may need a program per shape.
        let program = webglUtils.createProgramFromSources(gl,
            [this.vertexShaderSource, this.fragmentShaderSource]);
        var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        // look up uniform locations
        var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        var colorLocation = gl.getUniformLocation(program, "u_color");

        // Create a buffer
        var positionBuffer = gl.createBuffer();
        
        // Create a vertex array object (attribute state)
        var vao = gl.createVertexArray();

        // and make it the one we're currently working with
        gl.bindVertexArray(vao);

        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration for 2-d xy
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);
        
        // ################################################
        // Draw/render loop below.
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(vao);

        // Pass in the canvas resolution so we can convert from
        // pixels to clipspace in the shader
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // If there are things to render, choose the appropriate shape-renderer to draw each thing.
        if (this.stateToRender.length > 0){
            this.stateToRender.forEach(drawnObj => {
                if (drawnObj.tool==="rect"){
                    this.setRectangle(gl, colorLocation, drawnObj.pos, drawnObj.context);
                }else if (drawnObj.tool==="triangle"){
                    this.setTriangle(gl, colorLocation, drawnObj.pos, drawnObj.context);
                }else if (drawnObj.tool==="line"){
                    this.setLine(gl, colorLocation, drawnObj.pos, drawnObj.context);
                }else if (drawnObj.tool==="ellipse"){
                    this.setEllipse(gl, colorLocation, drawnObj.pos, drawnObj.context);
                }else if(drawnObj.tool==="pencil"){
                    this.setPencil(gl, colorLocation, drawnObj.pos, drawnObj.context);
                }
            })
        }
        
    }

    randomInt(range) {
        let is_positive = Math.random();
        let posneg = 1;
        if (is_positive<0.5){
            posneg = -1;
        }
        return Math.floor(Math.random() * range)*posneg;
    };

    setRectangle(gl, colorLocation, pos, context={}) {
        // Fill the buffer with the values that define a rectangle.
        let x1 = pos[0];
        let y1 = pos[1];
        let x2 = pos[2];
        let y2 = pos[3];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]), gl.STATIC_DRAW);

        // Set a random color.
        // gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
        // Set a color based on major minor radii.
        let color = [...context.color.slice(0,3).map((num)=>num/255),context.color[3]];
        gl.uniform4f(colorLocation, ...color);
            
        // Draw the rectangle.
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
    };

    setTriangle(gl, colorLocation, pos, context={}){
        // Unused, low-likelihood of actually being needed anyway.
        // Triangle must first draw a line from x1,y1 to x2,y2 before can draw a full triangle.
        // Explicitly state x1...y3 for easily read code
        let x1 = pos[0];
        let y1 = pos[1];
        let x2 = pos[2];
        let y2 = pos[3];
        let x3 = pos[4];
        let y3 = pos[5];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y2,
            x3, y3
        ]), gl.STATIC_DRAW);

        // Set a color from inputs.
        let color = [...context.color.slice(0,3).map((num)=>num/255),context.color[3]];
        gl.uniform4f(colorLocation, ...color);
            
        // Draw the triangle.
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 3;
        gl.drawArrays(primitiveType, offset, count);
    };

    setLine(gl, colorLocation, pos, context={}){
        // Setting lineWidth doesn't work!
        // gl.lineWidth(25.0);
        // Instead just gotta draw a tiny rectangle, calculating with 90* angles where to put it, if thickness is >1.
        // A good candidate for WASM
        // References:
        // https://community.khronos.org/t/simple-tutorial-needed-how-to-draw-a-line/2664/4
        // https://www.tutorialspoint.com/webgl/webgl_modes_of_drawing.htm
        // https://blog.scottlogic.com/2019/11/18/drawing-lines-with-webgl.html

        let x1 = pos[0];
        let y1 = pos[1];
        let x2 = pos[2];
        let y2 = pos[3];

        // hardcode thickness for now, as the line-thickness selection component hasn't yet been coded
        context.thickness = 2;

        // Set a color from inputs.
        let color = [...context.color.slice(0,3).map((num)=>num/255),context.color[3]];
        gl.uniform4f(colorLocation, ...color);

        if (context.thickness===1){
            // Draw the line with just a line if its thickness is just 1.
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y2]), gl.STATIC_DRAW);

            var primitiveType = gl.LINES;
            var offset = 0;
            var count = 2;
            gl.drawArrays(primitiveType, offset, count);
        }else{
            // With a greater thickness, we have to draw a rectangle after determining what the new corners are
            // First, find an angle for the PERPENDICULAR line to use for trig
            // Normally is Math.atan2((y2-y1),(x2-x1)).
            // Reverse the x and y positions to represent the perpendicular slope
            let angle = Math.atan2(-(x2-x1),(y2-y1)); 
            // Second, given a thickness, calculate the adjustments for the endpoint
            let adjustX = Math.cos(angle)*context.thickness;
            let adjustY = Math.sin(angle)*context.thickness;
            // Third, create new (x,y) pairs for the 4 corners representing the vertices of the line.
            let x1a = x1 + adjustX;
            let y1a = y1 + adjustY;
            let x1b = x1 - adjustX;
            let y1b = y1 - adjustY;

            let x2a = x2 + adjustX;
            let y2a = y2 + adjustY;
            let x2b = x2 - adjustX;
            let y2b = y2 - adjustY;
            
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                x1a, y1a,
                x2a, y2a,
                x2b, y2b,
                x2b, y2b,
                x1a, y1a,
                x1b, y1b
            ]), gl.STATIC_DRAW);
                
            // Draw the line.
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = 6;
            gl.drawArrays(primitiveType, offset, count);

        }
    };

    setPencil(gl, colorLocation, pos, context={}){
        // Endless vertices connected
        // First have to connect them.
        // This time, using triangle strips. Although could have used the same method in setRect

        // Creating a new array and drawing all from that is way way slower than just iterating and drawing bit by bit.
        // Why? I thought that feeding WebGL with the full array would be better for its parallelism, but it is not.
        // I have retained the slower code commented out below, just in case I find out if there's a solution. It's probably the JS array construction.

        context.thickness = 2;
        let color = [...context.color.slice(0,3).map((num)=>num/255),context.color[3]];
        gl.uniform4f(colorLocation, ...color);
        
        // let verticesArray = [];
        for (let i=0; i<=pos.length-4; i+=2){

            let x1 = pos[i];
            let y1 = pos[i+1];
            let x2 = pos[i+2];
            let y2 = pos[i+3];

            if (context.thickness===1.0){
                // Draw the line with just a line if its thickness is just 1.
                // verticesArray.push(x1,y1, x2,y2);
                var primitiveType = gl.LINES;
                var count = 2;
                var offset = 0;
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1,y1,x2,y2]), gl.STATIC_DRAW);
                gl.drawArrays(primitiveType, offset, count);
            }else{
                let angle = Math.atan2(-(x2-x1),(y2-y1));
                let adjustX = Math.cos(angle)*context.thickness;
                let adjustY = Math.sin(angle)*context.thickness;
                let x1a = x1 + adjustX;
                let y1a = y1 + adjustY;
                let x1b = x1 - adjustX;
                let y1b = y1 - adjustY;

                let x2a = x2 + adjustX;
                let y2a = y2 + adjustY;
                let x2b = x2 - adjustX;
                let y2b = y2 - adjustY;

                // verticesArray.push(x1a, y1a, x1b, y1b, x2a, y2a, x2b, y2b);
                var primitiveType = gl.TRIANGLE_STRIP;
                var count = 4;
                var offset = 0;
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1a, y1a, x1b, y1b, x2a, y2a, x2b, y2b]), gl.STATIC_DRAW);
                // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
                gl.drawArrays(primitiveType, offset, count);
            }
        }

        // let coordsLength = pos.length/4;
        // if (context.thickness===1){
        //     var primitiveType = gl.LINES;
        //     var count = 2*coordsLength;
        // }else{
        //     var primitiveType = gl.TRIANGLE_STRIP;
        //     var count = 4*coordsLength;
        // }
        // var offset = 0;
        // // then triangle strip for fun. 
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesArray), gl.STATIC_DRAW);
        // gl.drawArrays(primitiveType, offset, count);

    };

    setEllipse(gl, colorLocation, pos, context={}){
        // To draw a circle, draw triangles which all have the center of the circle as one of the vertices.
        // Can avoid using translation matrices by multiplying vertice values by the radius and adding the origin.
        // Translation may be faster, worth exploring in a future version.

        // https://www.youtube.com/watch?v=S0QZJgNTtEw
        // https://www.gamedev.net/forums/topic/69729-draw-ellipse-in-opengl/
        // https://community.khronos.org/t/how-to-draw-an-oval/13428/
        let x1 = pos[0];
        let y1 = pos[1];
        let x2 = pos[2];
        let y2 = pos[3];

        let degreeToRadian = Math.PI/180.0;
        let originX = (x2+x1)/2;
        let originY = (y2+y1)/2;
        let radiusX = Math.abs((x2-x1)/2);
        let radiusY = Math.abs((y2-y1)/2);
        let vertices = []
        for(let i=0; i<=360; i++){
            let radian = i * degreeToRadian;
            let vertex1 = [
                Math.cos(radian) * radiusX + originX, Math.sin(radian) * radiusY + originY
            ];
            let vertex2 = [
                originX, originY
            ]
            vertices.push(...vertex1);
            vertices.push(...vertex2);
        }

        // Add vertices into the buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Set a color from inputs
        let color = [...context.color.slice(0,3).map((num)=>num/255),context.color[3]];
        gl.uniform4f(colorLocation, ...color);
            
        // Draw the circle.
        var primitiveType = gl.TRIANGLE_STRIP;
        var offset = 0;
        var count = vertices.length / 2;
        gl.drawArrays(primitiveType, offset, count);
    }
}
