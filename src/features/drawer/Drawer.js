import React from 'react';
import styles from './Drawer.module.scss';

import { Toolbox } from "./toolbox/Toolbox";
import Canvas from "./canvas/Canvas";

// This component holds the whole drawing tool
// It's supposed to be fullheight (with navbar)
// The Toolbox has to float left. 

export function Drawer(){
    return (
        <div>
            <section className="hero is-fullheight-with-navbar"> 
                {/* <div className="hero-body">
                    <div className="container"> */}
                        <Canvas></Canvas>
                    {/* </div> */}
                {/* </div> */}
                        
            </section>
            <Toolbox></Toolbox> 
        </div> 
    )
}