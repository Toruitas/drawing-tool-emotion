// The Rust file is used to convert pixel positions to what needs to be rendered in WASM.
// Perhaps also determines if the location that is clicked is within the clickable area?

// IMPORTANT: Sometimes the WebGL work will be done here in Rust. Other times in JS, 
// Depending upon whether or not the task at hand requires more power.

// Hot damn, rounded lines are just a bunch of short straight segments. Segment size.
// Refer to https://github.com/lykhouzov/rust-wasm-webgl/tree/master/src
// https://github.com/lloydmeta/gol-rs



#[no_mangle]
pub fn add(a:i32, b:i32) -> i32{
    a+b
}

#[no_mangle]
pub fn test_vec(a:f32, b:f32){
    let mut v: Vec<f32> = Vec::with_capacity(8);
    v
}

#[no_mangle]
pub fn prepare_pencil_array(x1:f32, y1:f32, x2:f32, y2:f32, thickness:f32)->Vec<f32>{
    // let angle = Math.atan2(-(x2-x1),(y2-y1));
    // let adjustX = Math.cos(angle)*context.thickness;
    // let adjustY = Math.sin(angle)*context.thickness;
    // let x1a = x1 + adjustX;
    // let y1a = y1 + adjustY;
    // let x1b = x1 - adjustX;
    // let y1b = y1 - adjustY;

    // let x2a = x2 + adjustX;
    // let y2a = y2 + adjustY;
    // let x2b = x2 - adjustX;
    // let y2b = y2 - adjustY;
    // Rust replacement of the above. 

    let angle:f32 = (-1.0/((&y2-&y1)/(&x2-&x1))).atan();
    let adjustX:f32 = &angle.cos() * &thickness;
    let adjustY:f32 = angle.sin() * thickness;

    let x1a:f32 = &x1 + &adjustX;
    let y1a:f32 = &y1 + &adjustY;
    let x1b:f32 = x1 - &adjustX;
    let y1b:f32 = y1 - &adjustY;

    let x2a:f32 = &x2 + &adjustX;
    let y2a:f32 = &y2 + &adjustY;
    let x2b:f32 = x2 - adjustX;
    let y2b:f32 = y2 - adjustY;

    // (x1a, y1a, x1b, y1b, x2a, y2a, x2b, y2b)

    let mut v: Vec<f32> = Vec::with_capacity(8);
    v.push(x1a);
    v.push(y1a);
    v.push(x1b);
    v.push(y1b);
    v.push(x2a);
    v.push(y2a);
    v.push(x2b);
    v.push(y2b);

    v
    // vec![x1a, y1a, x1b, y1b, x2a, y2a, x2b, y2b]
    // vec![5.0]

    // let vertices: [f32;8] = [x1a, y1a, x1b, y1b, x2a, y2a, x2b, y2b];
    // vertices
    
}

#[no_mangle]
pub fn prepare_line_array(positions:Vec<f32>, thickness:f32) -> Vec<f32>{
    // let angle = Math.atan2(-(x2-x1),(y2-y1));
    // let adjustX = Math.cos(angle)*context.thickness;
    // let adjustY = Math.sin(angle)*context.thickness;
    // let x1a = x1 + adjustX;
    // let y1a = y1 + adjustY;
    // let x1b = x1 - adjustX;
    // let y1b = y1 - adjustY;

    // let x2a = x2 + adjustX;
    // let y2a = y2 + adjustY;
    // let x2b = x2 - adjustX;
    // let y2b = y2 - adjustY;
    // Rust replacement of the above. 
    let angle:f32 = (-1.0/((positions[3]-positions[1])/(positions[2]-positions[0]))).atan();
    let adjustX:f32 = &angle.cos() * thickness;
    let adjustY:f32 = &angle.sin() * thickness;

    let x1a:f32 = &positions[0] + &adjustX;
    let y1a:f32 = &positions[1] + &adjustY;
    let x1b:f32 = &positions[0] - &adjustX;
    let y1b:f32 = &positions[1] - &adjustY;

    let x2a:f32 = &positions[2] + &adjustX;
    let y2a:f32 = &positions[3] + &adjustY;
    let x2b:f32 = &positions[2] - &adjustX;
    let y2b:f32 = &positions[3] - &adjustY;

    vec![
        x1a, y1a,
        x2a, y2a,
        x2b, y2b,
        x2b, y2b,
        x1a, y1a,
        x1b, y1b
    ]

    
}