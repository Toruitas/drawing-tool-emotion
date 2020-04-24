import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './Toolbox.module.scss';
import {Tool} from "../tool/Tool";
import {ClearButton} from "../clearButton/ClearButton";
import ColorPicker from '../colorPicker/ColorPicker';
import CameraColor from "../cameraColor/CameraColor";


// The Toolbox component is mostly stylistic. It holds all the tool components with their icons.
// Completely stylistic, with no functionality.


export function Toolbox(){
    const [collapsed, setCollapsed] = useState(false);

    return (
        <nav id="toolbox" className="panel">
            <p className="panel-heading">Pick a tool</p>
            {/* <Tool toolName={"select"}></Tool> */}
            <Tool toolName={"line"}></Tool>
            <Tool toolName={"rect"}></Tool>
            <Tool toolName={"ellipse"}></Tool>
            <Tool toolName={"pencil"}></Tool>
            <ClearButton></ClearButton>
            {/* todo: add a CLEAR tool which then re-selects the last tool. */}
            <p className="panel-heading">Options</p>
            {/* <ColorPicker></ColorPicker> */}
            <CameraColor></CameraColor>
        </nav>
    )
}