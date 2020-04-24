import React from 'react';
import logo from './zlim.png';
import styles from './Navbar.module.scss';

export function Navbar(){
    return (
        <nav className="navbar is-fixed-top is-transparent">
        <div className="navbar-brand">
            <a className="navbar-item" href="/">
                <img src={logo} alt="Zlim: 3-way design tool" width="112" height="28" />
                <span id="navbar-brandname">Zlim Draw</span>
                <span>|</span>
            </a>
            <div className="navbar-burger burger" data-target="navbarExampleTransparentExample">
            <span></span>
            <span></span>
            <span></span>
            </div>
        </div>

        <div className="navbar-menu">
            <div className="navbar-start">
                <a className="navbar-item" href="/">
                    Freedraw
                </a>
                <a className="navbar-item" href="https://github.com/Toruitas/drawing-tool">
                    GitHub
                </a>

            </div>
            <div className="navbar-end">
                <span className="navbar-item">Please be patient, the ML model may take a moment to load.</span>
            </div>
        </div>
    </nav>
    )
}