import React from 'react';
import styles from './EmojiColor.module.scss';


export default function EmojiIcon({expressionName}){
    // This component accepts a toolName and uses an enum to display the correct icon from FontAwesome.
    
    // https://www.robinwieruch.de/conditional-rendering-react#conditional-rendering-in-react-switch-case
    // https://stackoverflow.com/questions/57827085/how-do-i-dynamically-display-an-icon-for-each-category-with-react  <- has my answer
    return (
        <span className="panel-icon">
            {
                {
                    neutral: <div className="emoji neutral">😐</div>,
                    happy: <div className="emoji happy">😃</div>,
                    sad: <div className="emoji sad">😭</div>,
                    angry: <div className="emoji angry">😠</div>,
                    fearful: <div className="emoji fear">😨</div>,
                    disgusted: <div className="emoji disgust">🤢</div>,
                    surprised: <div className="emoji surprise">😲</div>,
                }[expressionName]
        }
        </span>
    );
}