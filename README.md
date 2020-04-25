# Drawing Tool With Expressions

UAL: Creative Computing Institute



By me, Stuart Leitch!


Zlim Draw. Z represents a scribble, and "lim" since it's meant to be "slim" on the processor. My final project for Msc Creative Coding 2. This project uses ReactJS as an interface for a WebGL-based drawing tool, and Bulma as CSS framework. It's very impressive how fast rendering WebGL is. 

The original version of this lives in my other repo [here](https://github.com/Toruitas/drawing-tool). This version replaces the color picker with an emotion-detector. Depending on the expression you have on your face at any given time, the color will change! 

If you seek to replicate the face-api.js part, I had this error: `Error: Based on the provided shape, [1,1,32,64], the tensor should have ...` which was solved by renaming all the shards in /models to have the .bin suffix, and also update the .json weights to refer to the changed names, as suggested [here](https://github.com/justadudewhohacks/face-api.js/issues/404)

And I've taken a lot of learning away from Kevin Hsiao's project [here](https://github.com/kevinisbest/FrontEnd-EmotionDetection), and some from Google's TensorflowJS Models examples [here](https://github.com/tensorflow/tfjs-models).

This just a first step in a tool I'd like to build which can design
1) Layout
2) Components (probably low-code not no-code)
3) Free Draw

for purposes such as Art, Websites, or Marketing Materials. Anything that needs different levels of structure or freedom but is in the end one complete thing. Hopefully someone can make amazing work with it, now or in the future feature-rich version!

The intent behind those tools is that currently it's a bit tough to manage the three different layers of design. Fantastic single-use tools exist. Freedrawing? Photoshop, but do not use it for components. Layouts? Try Figma, but it's not good at freedrawing. Components? Good luck finding one to begin with. Having worked plenty with designers, and recognizing that oftentimes too much time is wasted going up and down a chain of specialized tools, I want to build a single that has a natural interaction between these aspects of its personality, so that more designer personality can shine through.

This project deals with the Free Draw stage, as it seems like as the more difficult starting point.

I've certainly grown a deeper appreciation for the complexity of drawing tools like Figma and Photoshop. No wonder the web versions of Photoshop and Illustrator are taking so long to come out. This stuff is tough. 

Project URL: https://drawing-tool-emotion.now.sh