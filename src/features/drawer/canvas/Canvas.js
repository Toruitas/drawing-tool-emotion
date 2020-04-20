import React, {Component} from 'react';
import { connect } from 'react-redux';
import styles from './Canvas.module.scss';
import { selectSelectedTool, selectVertices} from "../tool/toolSlice";
import { selectColor1 } from "../colorPicker/colorPickerSlice";
import { selectClearCanvas } from '../clearButton/clearButtonSlice';
import WglRunner from "./GL4";


// The Canvas component reads the state from other components (toolbox, color selector, clear canvas, etc...) via Redux.
// On user mouse interaction on the canvas, it performs the corresponding action on mouseDown, mouseUp, and mouseMove.
// Every time a coordinate pair is added to the list of stateToRender, stateToRender is send to the WglRunner, which takes the list
// and renders it.

class Canvas extends Component{
    // https://reactjs.org/docs/react-component.html
    constructor(props){
        super(props);
        this.state = {
            width:0, 
            height:0, 
            transX:0,
            transY:0,
            canUseGL2:true,
            stateToRender:[],  // list of objects
            selecting:false,
            mouseDown:false,
            currentlyDrawing:false,
            currentlyDrawingShape:{}, // obj w/ {tool:currentTool, pos: [x,y,x1,y1,...] coordinates}
        };

        this.canvas = React.createRef();

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.reorientMousePos = this.reorientMousePos.bind(this);
        this.updateCanvasSize = this.updateCanvasSize.bind(this);
        this.renderCanvas = this.renderCanvas.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);        
    }

    componentDidMount(){
        this.updateDimensions();
        window.addEventListener('resize', this.updateDimensions);

        this.renderCanvas(this.canvas.current);
    }

    componentDidUpdate() {
        this.updateCanvasSize();
        this.clearCanvas();

        this.renderCanvas(this.canvas.current);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
      }

      clearCanvas(){
        // When Redux state says clear, this deletes everything in the stateToRender and resets all other related state variables.
        // Then, the next WebGL render will have nothing to show. Just blank!
        if(this.props.clear){
            this.setState({
                stateToRender:[],
                selecting:false,
                currentlyDrawing:false,
                currentlyDrawingShape:{}
            })
        }
    }

    renderCanvas(canvas){
        // First, init the WebGL Manager
        // For each {shape, coodinates, context} group in the list of shapes
        // Use an enum or dict to determine which drawing fn to use based on supplied variables. 
        // Something like: {shape: function(dimensions, context),}
        // This inner fn will useProgram 
        let gl = this.canvas.current.getContext("webgl2")
        if(!gl){
            this.setState({canUseGL2:false});
        }else{
            // WebGL2 is available. Draw stuff!
            // get full list of saved shapes
            let stateToRender = this.state.stateToRender.slice();
            // if we're currently drawing something, we want the temporary shape as it's dragged around
            if (this.state.currentlyDrawing && this.state.currentlyDrawingShape != {}){
                stateToRender.push({
                    tool:this.props.tool,
                    pos: this.state.currentlyDrawingShape.tempPos,
                    context:{
                        color:this.props.color1
                    }
                });
            }
            // send list and GL to the WGL runner
            // console.log(stateToRender);
            let wglRunner = new WglRunner(gl, stateToRender);
            wglRunner.renderCanvas();
        }
    }

    updateDimensions () {
        // Fullscreen the canvas
        // Re-set the origin to the center of the screen
        // Why origin at center of screen? I plan on making it an infinite canvas in the future. (0,0) in the upper left won't work for that.
        this.setState({width:0, height:0})  // The resize listener is a bit "deaf," for some reason this seems to help.
        const rectangle = this.canvas.current.parentNode.getBoundingClientRect();
        this.setState({
             width: rectangle.width, 
             height: rectangle.height, 
             transX: rectangle.width * 0.5,
             transY: rectangle.height * 0.5,
             });
      };

    updateCanvasSize() {
        // first reset h & w
        // https://stackoverflow.com/questions/30229536/how-to-make-a-html5-canvas-fit-dynamic-parent-flex-box-container
        
        this.canvas.current.width = this.state.width;
        this.canvas.current.height = this.state.height;

        // todo LATER: scale when the objects on canvas exceed viewport size 
        // https://www.pluralsight.com/guides/render-window-resize-react

    }

    handleEscape(event){
        // Todo: When ESC key is pressed, reset selecting, currentlyDrawing, currentlyDrawingShape, tempPos, etc.
        // This is intended to keep the objects in stateToRender, but remove that of currentlyDrawingShape
    }

    handleMouseDown(event){
        // This only does anything when the pencil tool is selected. The pencil tool keeps drawing while the mouse button is pressed.
        // This adds the first coordinate pairs for the pencil tool.

        let adjusted_coords = this.reorientMousePos(event.nativeEvent.offsetX,event.nativeEvent.offsetY);
        if(!this.state.currentlyDrawing && this.props.tool === "pencil"){
            // add first vertex to the pencil drawing. We add 2 pairs so that it's a dot at first.
            let thickness = 2;
            this.setState({
                mouseDown:true,
                currentlyDrawing:true,
                currentlyDrawingShape:{
                    tool: this.props.tool,
                    color: this.props.color1,
                    tempPos:[
                        adjusted_coords.x, adjusted_coords.y,
                        adjusted_coords.x+thickness,  adjusted_coords.y+thickness
                    ],
                    pos:[
                        adjusted_coords.x, adjusted_coords.y,
                        adjusted_coords.x+thickness,  adjusted_coords.y+thickness
                    ]
                }
            });
        }
    }

    handleMouseUp(event){
        // Handles the coordinate pairs on most shapes, not pencil.
        // Will either start a shape, or complete a shape and add it to the saved list.

        // add current shape to stateToRender
        // reset currentlyDrawing to an empty obj
        // Move tempPos to savedPos. Add to 
        let adjusted_coords = this.reorientMousePos(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
        if (this.props.tool === "select"){
            // Select what is being clicked.
            console.log("Replace this with a test for withinShape()")
        } else if (
            !this.state.currentlyDrawing &&
            ( 
                this.props.tool === "rect" || 
                this.props.tool === "line" ||
                this.props.tool === "ellipse"
            )
            ){
            // start drawing by setting the first anchor/vertex.
            this.setState({
                currentlyDrawing:true,
                currentlyDrawingShape:{
                    tool: this.props.tool,
                    color: this.props.color1,
                    tempPos:[
                        adjusted_coords.x,
                        adjusted_coords.y
                    ],
                    pos:[
                        adjusted_coords.x,
                        adjusted_coords.y
                    ]
                }
            });
        }else if (this.state.currentlyDrawing) {
            if(this.props.tool === "pencil"){
                // mouse up is the end signal for the pencil tool, unlike other tools. This position should already have been captured by the move handler
                let savedPos = this.state.currentlyDrawingShape.tempPos.slice(0);
                let newShapesToDrawList = this.state.stateToRender.slice(0);  // copy the stateToRender rather than a ref

                newShapesToDrawList.push({
                    tool:this.props.tool,
                    pos: savedPos,
                    context:{
                        color:this.props.color1
                    }
                })

                this.setState({
                    mouseDown:false,
                    stateToRender:newShapesToDrawList,
                    currentlyDrawing:false,
                    currentlyDrawingShape:{}
                });
            }else{
                // Adding this coordinate to the saved list
                let savedPos = this.state.currentlyDrawingShape.pos.slice(0);
                savedPos.push(adjusted_coords.x, adjusted_coords.y);
                // if current length == max vertices, end the draw as the shape is complete
                // so we add the shape we just drew to the list of saved shapes
                // and clear the shape we're currently drawing.
                
                if (savedPos.length>=this.props.vertices*2){ // 2 vertices * 2 xy coords
                    let newShapesToDrawList = this.state.stateToRender.slice(0);  // copy the stateToRender rather than a ref
                    newShapesToDrawList.push({
                        tool:this.props.tool,
                        pos: savedPos,
                        context:{
                            color:this.props.color1
                        }
                    })
                    this.setState({
                        mouseDown:false,
                        stateToRender:newShapesToDrawList,
                        currentlyDrawing:false,
                        currentlyDrawingShape:{}
                    });
                }else{
                    // Otherwise, update the saved list of x,y coords with this one, and clear the temp positions.
                    this.setState({
                        mouseDown:false,
                        currentlyDrawingShape:{
                            tool: this.props.tool,
                            color: this.props.color1,
                            tempPos:[],
                            pos:savedPos
                        }
                    });
                }
            }
            
        }
        this.setState({mouseDown:false});
    }

    handleMouseMove(event){
        // This handles rendering the "temporary" shape as the mouse is moved around.
        let adjusted_coords = this.reorientMousePos(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
        
        if (this.state.currentlyDrawing){
            // This is agnostic to whichever drawing tool is selected.
            // Get the saved coordinates from the start of the shape
            let tempPos = this.state.currentlyDrawingShape.pos.slice(0);  // get a copy not a ref
            // The pencil holds entire drawn arry in tempPos, unlike other shapes.  
            if (this.props.tool==="pencil"){
                tempPos = this.state.currentlyDrawingShape.tempPos.slice(0);  
            }
            // add the temporary coordinates to the array
            tempPos.push(adjusted_coords.x, adjusted_coords.y);
            // update the state
            this.setState({
                currentlyDrawingShape:{
                    // tool: this.props.tool,
                    tempPos: tempPos,
                    pos: this.state.currentlyDrawingShape.pos.slice(0)
                }
            })
        }
    }

    reorientMousePos(x,y){
        // This method takes an (x,y) position in the canvas and converts it relative to the 
        // canvas orgin in the center of the screen
        return {
            x: x - this.state.transX,
            y: (y  - this.state.transY)*-1
        }
    }


    render(){
        return (
            <>
                <canvas id="gl-canvas" ref={this.canvas} width="1354" height="50" 
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    onMouseMove={this.handleMouseMove}>
                        
                    </canvas>
                {this.state.canUseGL2 ? null: <div className="hero-body">
                    <p className="container">
                    Your browser doesn't support WebGL 2. Please use a modern browser like
                    Firefox or Chrome. Safari really is the new Internet Explorer.
                    </p></div>
                }
            </>
        )
    }
};

const mapStateToProps = state => {
    return {
        tool: selectSelectedTool(state),
        vertices: selectVertices(state),
        color1: selectColor1(state),
        clear: selectClearCanvas(state)
    }
};

export default connect(mapStateToProps, null)(Canvas);