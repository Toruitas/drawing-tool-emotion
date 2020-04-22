import React, { Component } from "react";
import * as posenet from "@tensorflow-models/posenet";

const loadModels = async ()=>{
    // https://github.com/tensorflow/tfjs-models/tree/master/posenet
    const posenetModel = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75
      });
    // const emotionsModel = await 
}

const setupCamera = async () =>{
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
        throw new Error(
            "Browser API navigator.mediaDevices.getUserMedia not available"
        )
    }

    const video = document.getElementById('video');
    video.width = videoWidth;
    video.height = videoHeight;

    const mobile = isMobile();
    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
        facingMode: 'user',
        width: mobile ? undefined : videoWidth,
        height: mobile ? undefined : videoHeight,
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video);
        };
      });
}

async function loadVideo() {
    const video = await setupCamera();
    video.play();
  
    return video;
  }

class Camera extends Component(){
    // https://levelup.gitconnected.com/build-ad-dog-classifier-with-react-and-tensorflow-js-in-minutes-f08e98608a65
    constructor(props){
        super(props);
        this.state = {}
    }


    render(){
        return(
        <video id="video" playsinline style="display: none;">
        </video>
    )}
}