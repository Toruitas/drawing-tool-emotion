import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from "./clearButton.module.scss";
import {
    clearCanvas,
    resetClear,
    selectClearCanvas
} from "./clearButtonSlice";

// This component manages the clearing of the canvas when a user clicks the button.
export function ClearButton(){
    const dispatch = useDispatch();
    const shouldClearCanvas = useSelector(selectClearCanvas);

    useEffect(()=>{
        // After state has updated, reset the clear flag to false.
        if (shouldClearCanvas){
            dispatch(resetClear());
        }
    })

    const clearAndResetCanvas = () =>{
        // First, set the state in Redux for the Canvas to see and clear the list of stateToRender
        // Then, since we don't want to keep clearing, useEffect will trigger to reset the clear flag.
        dispatch(clearCanvas());
    }

    return (
        <div className="panel-block">
            <button className="button is-small" id="clear-button"
                onClick={()=>clearAndResetCanvas()}
                >Clear Canvas
            </button>
        </div>
    )
}