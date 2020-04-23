import React, { Component } from "react";

// const loadModels = async ()=>{
//     // https://github.com/tensorflow/tfjs-models/tree/master/posenet
//     const posenetModel = await posenet.load({
//         architecture: 'MobileNetV1',
//         outputStride: 16,
//         inputResolution: { width: 640, height: 480 },
//         multiplier: 0.75
//       });
//     // const emotionsModel = await 
// }

// const setupCamera = async () =>{
//     if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
//         throw new Error(
//             "Browser API navigator.mediaDevices.getUserMedia not available"
//         )
//     }

//     const video = document.getElementById('video');
//     video.width = videoWidth;
//     video.height = videoHeight;

//     const mobile = isMobile();
//     const stream = await navigator.mediaDevices.getUserMedia({
//         'audio': false,
//         'video': {
//             facingMode: 'user',
//             width: mobile ? undefined : videoWidth,
//             height: mobile ? undefined : videoHeight,
//         },
//     });
//     video.srcObject = stream;

//     return new Promise((resolve) => {
//         video.onloadedmetadata = () => {
//             resolve(video);
//         };
//     });
// }

// async function loadVideo() {
//     const video = await setupCamera();
//     video.play();
  
//     return video;
//   }

export default class Camera extends Component{
    // https://levelup.gitconnected.com/build-ad-dog-classifier-with-react-and-tensorflow-js-in-minutes-f08e98608a65
    constructor(props){
        super(props);
        this.state = {
            videoWidth:1280,
            videoheight:720
        }

        this.initCamera = this.initCamera.bind(this);
    }

    componentDidMount(){
        this.initCamera();
    }

    componentDidUpdate(){}

    async initCamera(){
        if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
            throw new Error(
                "Browser API navigator.mediaDevices.getUserMedia not available"
            )
        }
    
        const video = document.getElementById('video');
        video.width = this.state.videoWidth;
        video.height = this.state.videoHeight;
    
        const stream = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': {
                facingMode: 'user',
                width: this.state.videoWidth,
                height: this.state.videoHeight,
            },
        });
        video.srcObject = stream;
    
        // return new Promise((resolve) => {
        //     video.onloadedmetadata = () => {
        //         resolve(video);
        //     };
        // });
    }


    render(){
        return(
        <video id="video" playsinline style={{display: "none"}}>
        </video>
    )}
}