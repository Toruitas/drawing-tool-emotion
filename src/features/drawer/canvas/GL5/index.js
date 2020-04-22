import {webglUtils} from "./webgl-utils";

export default class WglRunner{
    constructor(gl, canvas, contextState={}){
        this.gl = gl;
        this.canvas = canvas;
        this.stateToRender = [];
        this.contextState = contextState;
        this.mouseDown = false;
        this.currentlyDrawing = false;
        this.currentlyDrawingShape = {}; // obj w/ {tool:currentTool, pos: [x,y,x1,y1,...] coordinates}
        this.canvasDims = {}


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

        this.init();
    }

    init = () => {
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener("onunload", this.handleUnload);
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();

        // WebGL initialization
        let gl = this.gl;
        // Currently we only have 1 program. Future version may need a program per shape.
        this.program = webglUtils.createProgramFromSources(gl,
            [this.vertexShaderSource, this.fragmentShaderSource]);
        this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
        // look up uniform locations
        this.resolutionUniformLocation = gl.getUniformLocation(this.program, "u_resolution");
        this.colorLocation = gl.getUniformLocation(this.program, "u_color");

        // Create a buffer
        this.positionBuffer = gl.createBuffer();
        
        // Create a vertex array object (attribute state)
        this.vao = gl.createVertexArray();

        // and make it the one we're currently working with
        gl.bindVertexArray(this.vao);

        // Turn on the attribute
        gl.enableVertexAttribArray(this.positionAttributeLocation);

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration for 2-d xy
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            this.positionAttributeLocation, size, type, normalize, stride, offset);
    }

    handleUnload = () =>{
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('resize', this.updateDimensions);
        this.canvas.removeEventListener('onunload', this.handleUnload);
    }

    updateDimensions = () => {
        // Fullscreen the canvas
        // Re-set the origin to the center of the screen
        // Why origin at center of screen? I plan on making it an infinite canvas in the future. (0,0) in the upper left won't work for that.
        const rectangle = this.canvas.parentNode.getBoundingClientRect();
        this.canvasDims = {
            width: rectangle.width, 
            height: rectangle.height, 
            transX: rectangle.width * 0.5,
            transY: rectangle.height * 0.5,
        }
        this.canvas.width = rectangle.width;
        this.canvas.height = rectangle.height;
    };


    clearCanvas = () =>{
        // When Redux state says clear, this deletes everything in the stateToRender and resets all other related state variables.
        // Then, the next WebGL render will have nothing to show. Just blank!

        this.stateToRender=[],
        this.selecting=false,
        this.currentlyDrawing=false,
        this.currentlyDrawingShape={}
        this.renderCanvas();
    }

    updateContextState = (contextState) =>{
        this.contextState = contextState;
        this.renderCanvas();
    }

    reorientMousePos = (x,y) =>{
        // This function takes an (x,y) position in the canvas and converts it relative to the 
        // canvas orgin in the center of the screen
        return {
            x: x - this.canvasDims.transX,
            y: (y  - this.canvasDims.transY)*-1
        }
    }

    handleMouseDown = (event) => {
        // This only does anything when the pencil tool is selected. The pencil tool keeps drawing while the mouse button is pressed.
        // This adds the first coordinate pairs for the pencil tool.

        let adjusted_coords = this.reorientMousePos(event.offsetX,event.offsetY);
        if(!this.currentlyDrawing && this.contextState.tool === "pencil"){
            // add first vertex to the pencil drawing. We add 2 pairs so that it's a dot at first.
            let dotThickness = 2;  // dotThickness hardcoded
            // update the states
            this.mouseDown = true;
            this.currentlyDrawing = true;
            this.currentlyDrawingShape = {
                tool: this.contextState.tool,
                color: this.contextState.color1,
                tempPos:[
                    adjusted_coords.x, adjusted_coords.y,
                    adjusted_coords.x+dotThickness,  adjusted_coords.y+dotThickness
                ],
                pos:[
                    adjusted_coords.x, adjusted_coords.y,
                    adjusted_coords.x+dotThickness,  adjusted_coords.y+dotThickness
                ]
            }
        }
        this.renderCanvas();
    }

    handleMouseUp = (event) => {
        // Handles the coordinate pairs on most shapes, not pencil.
        // Will either start a shape, or complete a shape and add it to the saved list.

        // add current shape to stateToRender
        // reset currentlyDrawing to an empty obj
        // Move tempPos to savedPos. Add to 
        let adjusted_coords = this.reorientMousePos(event.offsetX, event.offsetY);
        if (this.contextState.tool === "select"){
            // Select what is being clicked.
            console.log("Replace this with a test for withinShape()")
        } else if (
            !this.currentlyDrawing &&
            ( 
                this.contextState.tool === "rect" || 
                this.contextState.tool === "line" ||
                this.contextState.tool === "ellipse"
            )
            ){
            // start drawing by setting the first anchor/vertex.
            this.currentlyDrawing = true;
            this.currentlyDrawingShape = {
                tool: this.contextState.tool,
                color: this.contextState.color1,
                tempPos:[
                    adjusted_coords.x,
                    adjusted_coords.y
                ],
                pos:[
                    adjusted_coords.x,
                    adjusted_coords.y
                ]
            };
        }else if (this.currentlyDrawing) {
            if(this.contextState.tool === "pencil"){
                // mouse up is the end signal for the pencil tool, unlike other tools. This position should already have been captured by the move handler
                let savedPos = this.currentlyDrawingShape.tempPos.slice(0);
                let newShapesToDrawList = this.stateToRender.slice(0);  // copy the stateToRender rather than a ref

                newShapesToDrawList.push({
                    tool:this.contextState.tool,
                    pos: savedPos,
                    context:{
                        color:this.contextState.color1
                    }
                })

                // end the drawing state and update the list of shapes to render
                this.mouseDown = false;
                this.stateToRender = newShapesToDrawList;
                this.currentlyDrawing = false;
                this.currentlyDrawingShape={};

            }else{
                // Adding this coordinate to the saved list
                let savedPos = this.currentlyDrawingShape.pos.slice(0);
                savedPos.push(adjusted_coords.x, adjusted_coords.y);
                // if current length == max vertices, end the draw as the shape is complete
                // so we add the shape we just drew to the list of saved shapes
                // and clear the shape we're currently drawing.
                
                if (savedPos.length>=this.contextState.vertices*2){ // 2 vertices * 2 xy coords
                    let newShapesToDrawList = this.stateToRender.slice(0);  // copy the stateToRender rather than a ref
                    newShapesToDrawList.push({
                        tool:this.contextState.tool,
                        pos: savedPos,
                        context:{
                            color:this.contextState.color1
                        }
                    })
                    // end the drawing state and update the list of shapes to render
                    // DRY
                    this.mouseDown = false;
                    this.stateToRender = newShapesToDrawList;
                    this.currentlyDrawing = false;
                    this.currentlyDrawingShape={};
                }else{
                    // Otherwise, update the saved list of x,y coords with this one, and clear the temp positions.
                    // end the drawing state and update the list of shapes to render
                    this.mouseDown = false;
                    this.currentlyDrawingShape={
                        tool: this.contextState.tool,
                        color: this.contextState.color1,
                        tempPos:[],
                        pos:savedPos
                    };
                }
            }
            
        }
        this.mouseDown = false;
        this.renderCanvas();
    }

    handleMouseMove = (event) => {
        // This handles rendering the "temporary" shape as the mouse is moved around.
        let adjusted_coords = this.reorientMousePos(event.offsetX, event.offsetY);
        
        if (this.currentlyDrawing){
            // This is agnostic to whichever drawing tool is selected.
            // Get the saved coordinates from the start of the shape
            let tempPos = this.currentlyDrawingShape.pos.slice(0);  // get a copy not a ref
            // The pencil holds entire drawn arry in tempPos, unlike other shapes.  
            if (this.contextState.tool==="pencil"){
                tempPos = this.currentlyDrawingShape.tempPos.slice(0);  
            }
            // add the temporary coordinates to the array
            tempPos.push(adjusted_coords.x, adjusted_coords.y);
            // update the state
            this.currentlyDrawingShape = {
                tempPos: tempPos,
                pos: this.currentlyDrawingShape.pos.slice(0),
            }
        }
        this.renderCanvas();
    }

    handleEscape = (event) => {
        // Todo: When ESC key is pressed, reset selecting, currentlyDrawing, currentlyDrawingShape, tempPos, etc.
        // This is intended to keep the objects in stateToRender, but remove that of currentlyDrawingShape
    }

    consolodateStateToRender = () => {
        // Take the saved shapes and the temporary shapes and turn into one list for drawing
        let stateToRender = this.stateToRender.slice(0);
        // if we're currently drawing something, we want the temporary shape as it's dragged around
        if (this.currentlyDrawing && this.currentlyDrawingShape != {}){
            stateToRender.push({
                tool:this.contextState.tool,
                pos: this.currentlyDrawingShape.tempPos,
                context:{
                    color:this.contextState.color1
                }
            });
        }

        return stateToRender;
    }
    

    renderCanvas = () =>{
        // Lots of this code is adapted from https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html

        let gl = this.gl;
        let colorLocation = this.colorLocation;
        // ##############################################
        // Draw/render loop below.
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(this.vao);

        // Pass in the canvas resolution so we can convert from
        // pixels to clipspace in the shader
        gl.uniform2f(this.resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    
        // If there are things to render, choose the appropriate shape-renderer to draw each thing.
        let stateToRender = this.consolodateStateToRender();
        if (stateToRender.length > 0){
            stateToRender.forEach(drawnObj => {
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

    randomInt = (range) => {
        let is_positive = Math.random();
        let posneg = 1;
        if (is_positive<0.5){
            posneg = -1;
        }
        return Math.floor(Math.random() * range)*posneg;
    };

    setRectangle = (gl, colorLocation, pos, context={}) => {
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

    setTriangle = (gl, colorLocation, pos, context={}) =>{
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

    setLine = (gl, colorLocation, pos, context={}) => {
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

    setPencil = (gl, colorLocation, pos, context={}) => {
        // Endless vertices connected
        // First have to connect them.
        // This time, using triangle strips. Although could have used the same method in setRect

        // Creating a new array and drawing all from that is way way slower than just iterating and drawing bit by bit.
        // Why? I thought that feeding WebGL with the full array would be better for its parallelism, but it is not.
        // I have retained the slower code commented out below, just in case I find out if there's a solution. It's probably the JS array construction.

        // TODO: https://stackoverflow.com/questions/54500094/is-there-a-way-to-increase-javascripts-onmousemove-events-update-speed
        // https://pomax.github.io/bezierinfo/

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

    setEllipse = (gl, colorLocation, pos, context={}) => {
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
