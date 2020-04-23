import React, { Component } from "react";
import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';


const loadModels = async ()=>{
    // https://github.com/tensorflow/tfjs-models/tree/master/posenet
    // const posenetModel = await posenet.load({
    //     architecture: 'MobileNetV1',
    //     outputStride: 16,
    //     inputResolution: { width: 640, height: 480 },
    //     multiplier: 0.75
    //   });
    // https://www.tensorflow.org/js/tutorials/conversion/import_keras
    const emotionsModel = await tf.loadLayersModel('tiny_face_detector_model-weights_manifest.json');

}

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
    // This component uses face-api.js to detect expressions, and match it to a color + emoji for drawing.
    // https://levelup.gitconnected.com/build-ad-dog-classifier-with-react-and-tensorflow-js-in-minutes-f08e98608a65
    constructor(props){
        super(props);
        this.state = {
            videoWidth:1280,
            videoheight:720
        }

        this.initCamera = this.initCamera.bind(this);
        this.loadModels = this.loadModels.bind(this);
        this.initDetectors = this.initDetectors.bind(this);
        this.loadVideo = this.loadVideo.bind(this);
        this.detectExpressionInRealTime = this.detectExpressionInRealTime.bind(this);
    }


    componentDidMount(){
        
        // this.loadModels();
        // this.video = this.initCamera();
        this.initDetectors();
        
    }


    componentDidUpdate(){}

    async initDetectors(){
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            // faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            // faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models')
          ]).then(async ()=>{
              let video = await this.loadVideo();
                setInterval( async () => {
                    await this.detectExpressionInRealTime(video);
                }, 100)
          }
              
            
            //   async () => {
            //       this.video = await this.initCamera().then( 
            //         () =>{
            //             setInterval( () => {
            //                 detectExpressionInRealTime();
            //             }, 100);
            //         })
            //     }
            )
    }


    async loadModels(){
        // https://github.com/tensorflow/tfjs-models/tree/master/posenet
        // const posenetModel = await posenet.load({
        //     architecture: 'MobileNetV1',
        //     outputStride: 16,
        //     inputResolution: { width: 640, height: 480 },
        //     multiplier: 0.75
        //   });
        // https://www.tensorflow.org/js/tutorials/conversion/import_keras

        // const emotionsModel = await tf.loadModel('tiny_face_detector_model-weights_manifest.json');
        // const emotionsModel = await faceapi.nets.ssdMobilenetv1.loadFromUri('./models/tiny_face_detector_model-weights_manifest.json');
        // const emotionsModel = await faceapi.loadFaceExpressionModel('./models/');
        const emotionsModel = await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        this.emotionsModel = emotionsModel;
    }

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
    
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
        
    }

    async loadVideo() {
        const video = await this.initCamera();
        video.play();
      
        return video;
      }

    async detectExpressionInRealTime(video){
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        // z = this.emotionsModel.predict(cT)
        // let index = z.argMax(1).dataSync()[0]
        // let label = emotion_labels[index];
        // ctx.strokeStyle = emotion_colors[index];
        console.log(detection);
    }

    getFaceDetectorOptions() {
        // https://github.com/justadudewhohacks/face-api.js/blob/master/examples/examples-browser/public/js/faceDetectionControls.js
        const SSD_MOBILENETV1 = 'ssd_mobilenetv1'
        let selectedFaceDetector = SSD_MOBILENETV1

        // ssd_mobilenetv1 options
        let minConfidence = 0.5

        // tiny_face_detector options
        let inputSize = 512
        let scoreThreshold = 0.5

        return selectedFaceDetector === SSD_MOBILENETV1
          ? new faceapi.SsdMobilenetv1Options({ minConfidence })
          : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
      }

    render(){
        return(
        <video id="video" playsInline style={{display: "none"}}>
        </video>
    )}
}