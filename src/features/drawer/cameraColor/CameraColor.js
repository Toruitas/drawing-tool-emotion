import React, { Component } from "react";
import { connect } from "react-redux";
// import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';
import styles from './cameraColor.module.scss';
import {EmojiColorSelection} from "./emojiColorSelection/emojiColorSelection";
import {
    updateColor
} from "./cameraColorSlice";

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

const emotionalColors ={
    "angry":[255,0,0],
    "disgust":[0,168,0],
    "fear":[255,79,193],
    "happy":[255,225,0],
    "sad":[48,110,255],
    "surprise":[255,157,0],
    "neutral":[124,124,124]
}


class ConnectedCamera extends Component{
    // This component uses face-api.js to detect expressions, and match it to a color + emoji for drawing.
    // https://levelup.gitconnected.com/build-ad-dog-classifier-with-react-and-tensorflow-js-in-minutes-f08e98608a65
    constructor(props){
        super(props);
        this.state = {
            videoWidth:1280,
            videoheight:720,
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
        // https://github.com/WebDevSimplified/Face-Detection-JavaScript/blob/master/script.js
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/'),
            // faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            // faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/')
          ]).then(async ()=>{
                let video = await this.loadVideo();
                setInterval( async () => {
                    await this.detectExpressionInRealTime(video);
                }, 200)
                // to-do add some way to break this when the camera turns off
          })
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

        // const emotionsModel = await tf.loadModel("path.json");
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

        // console.log(detection);
        // {
        //     "detection": {
        //       "_imageDims": {
        //         "_width": 1280,
        //         "_height": 720
        //       },
        //       "_score": 0.8905331261915336,
        //       "_classScore": 0.8905331261915336,
        //       "_className": "",
        //       "_box": {
        //         "_x": 615.9090378566087,
        //         "_y": 394.3206899741401,
        //         "_width": 209.20186807514312,
        //         "_height": 215.32221972863894
        //       }
        //     },
        //     "expressions": {
        //       "neutral": 0.9999953508377075,
        //       "happy": 0.000004016027560282964,
        //       "sad": 2.7672335534134618e-8,
        //       "angry": 3.299382740351575e-7,
        //       "fearful": 6.909939981314395e-11,
        //       "disgusted": 5.637583733175688e-10,
        //       "surprised": 2.0137163403433078e-7
        //     }
        //   }

        // get the key with the highest confidence: https://stackoverflow.com/questions/27376295/getting-key-with-the-highest-value-from-object
        let expressions = detection.expressions;
        let expression_prediction = Object.keys(expressions).reduce((a,b) => expressions[a] > expressions[b] ? a: b);
        let color = emotionalColors[expression_prediction];
        this.props.updateColor({
             color:[color[0], color[1], color[2], 1],
             expression:expression_prediction
            });
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
            <div>
                <EmojiColorSelection expressionName="neutral"></EmojiColorSelection>
                <EmojiColorSelection expressionName="happy"></EmojiColorSelection>
                <EmojiColorSelection expressionName="sad"></EmojiColorSelection>
                <EmojiColorSelection expressionName="angry"></EmojiColorSelection>
                <EmojiColorSelection expressionName="fearful"></EmojiColorSelection>
                <EmojiColorSelection expressionName="disgusted"></EmojiColorSelection>
                <EmojiColorSelection expressionName="surprised"></EmojiColorSelection>
                <video id="video" playsInline style={{display: "none"}}>
                </video>
            </div>
    )}
}

function mapDispatchToProps(dispatch) {
    return {
        updateColor: color => dispatch(updateColor(color))
    };
  }

  const Camera = connect(
    null,
    mapDispatchToProps
  )(ConnectedCamera);
  
  export default Camera;