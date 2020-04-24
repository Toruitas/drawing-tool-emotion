import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './emojiColorSelection.module.scss';
import EmojiIcon from "./emojiColorIcon/emojiColorIcon";
import {
    selectSelectedExpression
} from '../cameraColorSlice';

// This component manages a single tool and its design within the toolbox
// It also sets some state variables that will be used by the canvas during user interaction



export function EmojiColorSelection({expressionName}){
    const currentlySelectedExpression = useSelector(selectSelectedExpression);
    const isActive = currentlySelectedExpression === expressionName ? 'is-active' : '';
    const classes = "panel-block " + isActive;

    return (
        <div className={classes}>
            <EmojiIcon expressionName={expressionName}></EmojiIcon>
            {expressionName}
        </div>
    )
}