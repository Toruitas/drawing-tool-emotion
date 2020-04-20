# Drawing-tool

UAL: Creative Computing Institute

Taught by Professor Mick Grierson

By me, Stuart Leitch!


Zlim Draw. Z represents a scribble, and "lim" since it's meant to be "slim" on the processor. My final project for Msc Creative Coding 2. This project uses ReactJS as an interface for a WebGL-based drawing tool, and Bulma as CSS framework. It's very impressive how fast rendering WebGL is. 

This just a first step in a tool I'd like to build which can design
1) Layout
2) Components (probably low-code not no-code)
3) Free Draw

for purposes such as Art, Websites, or Marketing Materials. Anything that needs different levels of structure or freedom but is in the end one complete thing. Hopefully someone can make amazing work with it, now or in the future feature-rich version!

The intent behind those tools is that currently it's a bit tough to manage the three different layers of design. Fantastic single-use tools exist. Freedrawing? Photoshop, but do not use it for components. Layouts? Try Figma, but it's not good at freedrawing. Components? Good luck finding one to begin with. Having worked plenty with designers, and recognizing that oftentimes too much time is wasted going up and down a chain of specialized tools, I want to build a single that has a natural interaction between these aspects of its personality, so that more designer personality can shine through.

This project deals with the Free Draw stage, as it seems like as the more difficult starting point.

I've certainly grown a deeper appreciation for the complexity of drawing tools like Figma and Photoshop. No wonder the web versions of Photoshop and Illustrator are taking so long to come out. This stuff is tough. 

Project URL: https://drawing-tool.now.sh/


## Project journal:

This is chronological.

#### TL;DR:
* Learned some Rust for Rust -> WebAssembly
* Babel doesn't like Webpack 5's `import await` syntax -> forked and upgraded it
* Hard Drive Failed -> Started over
* React + Redux perfect project use case, boostrapped with Create React App
* WebGL drawing multiple and new shapes hard to grok, but grokked in the end
* ParcelJS's Rust -> WASM conversion breaks `Vec<T>`
* Removed WASM for this version, in a major disappointment
* Drawing tool works pretty alright! Same features as Blackboard Collab Ultra's streaming drawing tool!
* Deployed on Zeit: https://drawing-tool.now.sh/

Final functionality as of 16/4/2020:
* Rectangle tool
* Ellipse tool
* Line tool
* Pencil tool
* Color picker
* Canvas clearer

This project originally envisioned relying to a much heavier degree to WebAssembly, either using [Emscripten](https://emscripten.org/) to transpile C/C++ to WebAssembly or Rust's (wasm-pack and wasm-bindgen)[https://rustwasm.github.io/]. I managed to get some very simple C transpiled into WASM with Emscripten, merely add and subtract, as test cases to see how to import them into a React project.

The default packer for a React project is Webpack, currently on version 4. It does not support importing `.wasm` files. 

Luckily, Webpack 5 does support it. To install it was simple enough, `npm install webpack@beta`. Afterwards, in a single, vanilla JS module, I could use something like `import await { add, subtract } from "./math.js"` and it would work. Great. [Sourcecode](https://github.com/Toruitas/webpack5wasm)

But it was not so easy, since while Webpack 5 does support it, `babel` does not. Babel is a critical dependency for React. Simply using Webpack 5 and the same code as before doesn't work in a React project, like this: [source](https://github.com/Toruitas/react-wasm-exp/blob/master/src/app/features/counter/counterSlice.js). Babel throws errors when it sees `await` in `import await` as it is such new syntax, and Webpack won't import without the `await`. An immovable object meets an unstoppable force.

I decided to fork Babel and convince its parser to allow `await` after `import`. Babel is an insanely complicated package, but I succeeded! The [babel source is here](https://github.com/Toruitas/babel) and [babel-parser here](https://github.com/Toruitas/babel/tree/master/packages/babel-parser). Originally I had intended to submit a pull request and have this included in production Babel, but following this success, Webpack started telling me that I had to convert EVERYTHING to `import await` all the way up to the root `index.js`, which I suspected would break things in how React gets compiled. 

I abandoned using Webpack, despite all the work I had put into forking and adding the new feature to the `babel-parser`. Instead, the current version of the project uses [Parcel](https://parceljs.org/), which *just works.* At this point I also switched from Emscripten and C/C++ to the Rust WASM ecosystem. 

To explore using `wasm-bindgen` and Rust, I followed [this tutorial](https://rustwasm.github.io/docs/book/) and recreated Conway's Game of Life. [RIP John Conway.](https://arstechnica.com/science/2020/04/john-conway-inventor-of-the-game-of-life-has-died-of-covid-19/) Fantastic tutorial. Fun, informative. Even learned about profiling, as I did all the challenges at the bottom of each page, except for the WebGL one. 

Unfortunately, the very day after I completed it, my computer's HDD crashed, and I never pushed to GitHub! I also lost the rest of this class's labwork. Rust's own GitHub repo without the challenges [lives here - not mine](https://github.com/rustwasm/wasm_game_of_life). It's a shame, since some of the challenges were diffcult indeed. Losing my references and experiments was a bit of a setback.

I also lost (thankfully, only) one day of work on the project, but that didn't take long to re-create and push to the repo this README belongs to. I used a 10-year old Dell laptop for the 15 days it took to get a replacement drive to get my proper MSI work machine back in action. Major kudos to Microsoft. VSCode is so lightweight that on a 10-year old laptop it still runs smooth as butter.

I've shifted the plan from most WebGL code in WASM to putting it in JS, after discovering that no matter whether I use Rust or C-based WASM, it has no direct interface with WebGL and must sort of piggy-back on JS bindings.

The structure of the project is a React-Redux project. The Toolbox component on the left side is a component which contains Tools. Each tool is a component which connects to the Redux store to let the entire project know which tool is being selected and how many vertices that tool should be used to draw. The Options context box within the toolbox currently only allows color picking, but I would like to add more choices, such as line-thickness.

![Canvas and Toolbox](/worklog/2020-04-02_canvas_and_toolbox.png)

The Canvas component can read the Redux state for tool and context, and behave appropriately when a user clicks on the canvas. All the `mouseUp`/`mouseDown`/`mouseMove` events are handled on the Canvas component. 

The most ridiculous part of the project so far? I spent an entire day trying to figure out how to copy a string from Redux state into Canvas local state, only to realize the bug was a missing assignment elsewhere, and there was never a problem copying the string in the first place.

Once I got the canvas(2d) and toolbox situated, I replaced the canvas(2d) with a canvas(webgl2). However, my test for WebGL2 support failed! Not due to browser incompatibility, but due to my 10-year-old computer not having hardware which supports it. Wow! Back to WebGL1, until my new SSD arrived and main laptop was back in action, at which point I continued with WebGL2.

![Webgl2 test](/worklog/2020-04-03_webgl2_test.png)

Having a single Tool component with dynamic icons depending on the tool name was a nice exercise in using React's props within React hooks functional components.

![Tool icons](/worklog/2020-04-09_added_icons.png)

It was a struggle to comprehend how to draw multiple user-drawn shapes with WebGL. What it came down to is that the ENTIRE WebGL program has to be re-initialized and re-rendered every single time the state updates. This is very very fast, so it's really not a problem at all. React naturally re-renders every time the state is updated, making it easy to trigger a WebGL re-render. First, I drew a rectangle.

![Drawing rectangles with the mouse](/worklog/2020-04-13_mouse_drawn_squares.png)

The math behind drawing a line and circle at a given (x,y) was non-intuitive. Drawing with triangles! Especially drawing a LINE was far, far more complicated than expected. The WebGL API's lineWidth setting doesn't function cross-platform, so I had to turn line-drawing into a fancy rectangle-drawing tool. Trigonometry, amazing stuff! This was before getting into the pencil tool.

![Drawing circles](/worklog/2020-04-14_drawing_circles.png)
![Drawing lines](/worklog/2020-04-14_drawing_lines.png)

Drawing with only a single (or worse, random) color is boring. I used the `react-color` package to add a color picker component to the toolbox, which updates the React state 

![Drawing with color](/worklog/2020-04-14_drawing_with_picked_color.png)

Having to refresh the window each time to get a fresh canvas is also boring. I added a canvas clearing tool so that starting over is easier.

![Canvas clearing](/worklog/2020-04-15_clear_canvas.png)

The pencil tool is not as fast as I would like. I attempted 2 approaches. 
1) Take the array of positions, build a new array based on that array, and put this new array which is ~4x the length of the original directly into WebGL to draw all at once. Surprisingly, this was very slow! I thought that it was better to put a lot of coordinates into WebGL all at once. I realize the cause of the chug is most likely the re-creation of the array each time the mouse moves.
2) I take the original array, and draw a chunk of it as a time as I loop through it. This was faster, but not fast enough. Using this approach it's at a usable 30FPS, but React isn't passing through the coordinates quickly enough onMouseMove, as a result of its own rendering process, so with a swiftly moving mouse, vertices can be quite far apart. Not sure how I can solve the lack of responsiveness of the mouse.

![Drawing with a pencil](/worklog/2020-04-15_pencil.png)

I originally planned on putting all the math in a Rust file for transpilation into WebAssembly. Regrettably, the Parcel.js packer's Rust-> WASM process is unreliable. In my experimentation, the resulting `.wasm` functions have memory issues whenever a `Vec<T>` is used. It could even be a function that only has an empty Vector. See the `test_vec` function [here](src/features/drawer/canvas/math/src/lib.rs) for an example that has the memory error, and the adjacent `add` which works fine. 

To solve the memory issue, the likely solution would be to use the approach from the earlier Conway Game of Life tutorial, as it used `Vec<T>` without issue. I would move far more logic and all the WebGL into Rust, as much as possible. Since React's render cycle is also a limiting factor, I would also put the listeners for the mouse into Rust as well. The big question there would be how to get the React state into the canvas for information about user-selected tools and context like color or line-thickness. Perhaps I could expose an `update_rust_state` function to the React component which... updates the Rust state to the inputs. 

What's even more boring? Photos and a journal about a web tool. I deployed the project using Zeit to: https://drawing-tool.now.sh/ . Deployment with Zeit was super easy for this React project. It hooked right into the GitHub repo, built, and deployed. Wow. This is crazy cool, and way easier than all other deployments I've done. I see potential for Zeit + React + some sort of content API for quick web projects.

**The final deployment:**
![Drawing online](/worklog/2020-04-16_final_deployment.png)


---


Please see my [package.json](/package.json) to see which packages I used, pretty ordinary React with Redux project packages. The only "feature" package I used was `react-color` for an out-of-the-box color picker, which I could easily connect to the application state. I would like to go back later and roll my own version with more emphasis on palettes. 

Credit for a lot of my WebGL learning goes to the following resources:
* https://github.com/jonathanrydholm/webgl-boilerplate
* https://webglfundamentals.org & https://webgl2fundamentals.org 

And the following for Rust/WASM:
* https://rustwasm.github.io/docs/book/game-of-life/introduction.html 
* https://doc.rust-lang.org/book/ 
* https://github.com/maxbittker/sandspiel 

Icons from FontAwesome

Initial project setup from [Create React App Template Redux](https://www.npmjs.com/package/cra-template-redux)

Logo done sarcastically by my girlfriend [Molly Zhou](https://mollyzhou.com/), who cheekily did everything I told her to do, thus proving once again that clients should let the designer design rather than micromanage