import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './Tool.module.scss';
import ToolIcon from "./toolIcon/ToolIcon";
import {
    selectATool,
    selectSelectedTool
} from './toolSlice';

// This component manages a single tool and its design within the toolbox
// It also sets some state variables that will be used by the canvas during user interaction

export function Tool({toolName}){
    const currentlySelectedTool = useSelector(selectSelectedTool);
    const dispatch = useDispatch();
    const isActive = currentlySelectedTool === toolName ? 'is-active' : '';
    const classes = "panel-block " + isActive;    

    return (
        <div className={classes} onClick={() => dispatch(selectATool(toolName))}>
            <ToolIcon toolName={toolName}></ToolIcon>
            {toolName}
        </div>
    )
}