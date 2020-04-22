import React, {Component} from 'react';
import { connect } from 'react-redux';
import styles from './Canvas.module.scss';
import { selectSelectedTool, selectVertices} from "../tool/toolSlice";
import { selectColor1 } from "../colorPicker/colorPickerSlice";
import { selectClearCanvas } from '../clearButton/clearButtonSlice';
import WglRunner from "./GL5";


// The Canvas component reads the state from other components (toolbox, color selector, clear canvas, etc...) via Redux.
// On user mouse interaction on the canvas, it performs the corresponding action on mouseDown, mouseUp, and mouseMove.
// Every time a coordinate pair is added to the list of stateToRender, stateToRender is send to the WglRunner, which takes the list
// and renders it.

class Canvas extends Component{
    // https://reactjs.org/docs/react-component.html
    constructor(props){
        super(props);
        this.state = {
            canUseGL2:true,
        };

        this.canvas = React.createRef();
        this.wglRunner;
        this.initCanvas = this.initCanvas.bind(this);
        this.tryClearCanvas = this.tryClearCanvas.bind(this);
        this.updateWglWithContext = this.updateWglWithContext.bind(this);
    }

    componentDidMount(){
        this.initCanvas();
    }

    componentDidUpdate() {
        // send new state to the GL runner
        this.tryClearCanvas();
        this.updateWglWithContext();
    }

    componentWillUnmount() {
    }

    initCanvas(){
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
            // send list and GL to the WGL runner
            // console.log(stateToRender);
            let wglRunner = new WglRunner(gl, this.canvas.current, {
                tool: this.props.tool,
                vertices: this.props.vertices,
                color1: this.props.color1,
            });
            this.wglRunner = wglRunner;
        }
    }

    updateWglWithContext(){
        // this takes the Redux state and updates WGL with it.
        let context = {
            tool: this.props.tool,
            vertices: this.props.vertices,
            color1: this.props.color1,
        }
        this.wglRunner.updateContextState(context);
    }

    tryClearCanvas(){
        if(this.props.clear){
            this.wglRunner.clearCanvas();
        }
    }


    render(){
        return (
            <>
                <canvas id="gl-canvas" ref={this.canvas} width="1354" height="50"></canvas>
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