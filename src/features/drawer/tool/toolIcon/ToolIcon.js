import React from 'react';

// const ICON_STATES = {
//     select: <i className="fas fa-mouse-pointer" aria-hidden="true"></i>,
//     rect: <i className="fas fa-vector-square" aria-hidden="true"></i>,
//     line: <i class="fas fa-minus" aria-hidden="true"></i>
// }

export default function ToolIcon({toolName}){
    // This component accepts a toolName and uses an enum to display the correct icon from FontAwesome.
    
    // https://www.robinwieruch.de/conditional-rendering-react#conditional-rendering-in-react-switch-case
    // https://stackoverflow.com/questions/57827085/how-do-i-dynamically-display-an-icon-for-each-category-with-react  <- has my answer
    return (
        <span className="panel-icon">
            {
                {
                    select: <i className="fas fa-mouse-pointer" aria-hidden="true"></i>,
                    rect: <i className="fas fa-vector-square" aria-hidden="true"></i>,
                    line: <i className="fas fa-minus" aria-hidden="true"></i>,
                    ellipse: <i className="fas fa-circle" aria-hidden="true"></i>,
                    pencil: <i className="fas fa-pencil-alt" aria-hidden="true"></i>
                }[toolName]
        }
        </span>
    );
}