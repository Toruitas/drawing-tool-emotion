import React from 'react';
import { connect } from "react-redux";
import { SketchPicker } from 'react-color';
import styles from './colorPicker.module.scss';
import {
    updateColor
} from "./colorPickerSlice";

// This React class component wraps the "react-color" component and connects it to the Redux store, and thus the rest of the app.
class ConnectedColorPicker extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            background: '#e8e8e8',
        };
        this.handleChangeComplete = this.handleChangeComplete.bind(this);
    }
    // http://casesandberg.github.io/react-color/#create-parent
    
  
    handleChangeComplete = (color, event) => {
      this.setState({ background: color.rgb });
      this.props.updateColor([color.rgb.r, color.rgb.g, color.rgb.b, color.rgb.a]);
    };
  
    render() {
      return (
        <SketchPicker
          color={ this.state.background }
          onChangeComplete={ this.handleChangeComplete }
        />
      );
    }
  }

  function mapDispatchToProps(dispatch) {
    return {
        updateColor: color => dispatch(updateColor(color))
    };
  }

  const ColorPicker = connect(
    null,
    mapDispatchToProps
  )(ConnectedColorPicker);
  
  export default ColorPicker;