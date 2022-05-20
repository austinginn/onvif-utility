//ONVIF PTZ CMD LINE TOOL
//by Austin Ginn

//TODO
//disconnect and reconnect handling
//verbose mode for debugging
//simple ui for connection status and keybinding
//refactor camera connect function
import EventEmitter from 'events';
import OnvifManager from 'onvif-nvt';
import fs from 'fs';

//load config files
let rawdata = fs.readFileSync('cameras.json');
let cameras = JSON.parse(rawdata);
console.log("cameras.json loaded");

rawdata = fs.readFileSync('keybinds.json');
let keybinds = JSON.parse(rawdata);
console.log("keybinds.json loaded");

//Global Constants
const eventEmitter = new EventEmitter();
const VELOCITY = .01; // multiply by -1 depending on direction --- this is minimum value supported
const MAX_CONNECTION_ATTEMPTS = 5;

//Globals
let selected = 1; //current selected camera id -- default to 1

//Main because async...
const main = async () => {
    //////////////////////////
    //GLOBAL EVENT LISTENERS//
    //////////////////////////
    eventEmitter.on("message", (msg) => {
        console.log(msg);
        //push to ui
    });

    ////////////////
    //PTZ HANDLING//
    ////////////////
    for (let i = 0; i < cameras.length; i++) {
        let camera = cameras[i];
        connect(camera.ip, camera.port, camera.user, camera.pass, camera.id);
    }

    ///////////////////////////
    //KEYBOARD INPUT HANDLING//
    ///////////////////////////
    control();
}

//Connect to a camera and handle events
//currently no reconnect trys on a disconnect
//onvif dependency connection timeout is unknown
//test disconnect cases and then handle them in a catch block for reconnect functionality
const connect = async (ip = "192.168.1.1", port = 2000, user = "admin", pass = "admin", id = "1", attempt = 0) => {
    //connect
    let cam;
    try {
        // let onvif = new OnvifManager; //documentation not clear if this actually handles multiple connections of if you need a seperate object for each connection
        cam = await OnvifManager.connect(ip, port, user, pass);
        // console.log(cam);
    } catch (err) { //catch block for initial onvif connection failure
        attempt++;
        console.log(ip + ":" + port + " | Connection attempt #" + attempt);

        if (attempt < MAX_CONNECTION_ATTEMPTS) { connect(ip, port, user, pass, id, attempt); }
        else { console.log(ip + ":" + port + " | Connection failed"); }
        return -1;
    }

    eventEmitter.emit("message", "Camera " + id + ": Connected!");


    if (!cam.ptz) { throw err } //ptz controls not supported by camera -- reconnect attempt?
    
    eventEmitter.on("camera_" + id, async (cmd) => {
        let vector = { x: 0, y: 0, z: 0 } //no movement
        try {
            switch (cmd) {
                case "stop":
                    await cam.ptz.stop();
                    break;
                case "left":
                    vector = { x: VELOCITY * -1, y: 0, z: 0 }; //left
                    await cam.ptz.continuousMove(null, vector);
                    break;
                case "right":
                    vector = { x: VELOCITY, y: 0, z: 0 }; //right
                    await cam.ptz.continuousMove(null, vector);
                    break;
                case "up":
                    vector = { x: 0, y: VELOCITY, z: 0 }; //up
                    await cam.ptz.continuousMove(null, vector);
                    break;
                case "down":
                    vector = { x: 0, y: VELOCITY * -1, z: 0 }; //up
                    await cam.ptz.continuousMove(null, vector);
                    break;
                default:
                    break;
            }
        } catch (err) { console.log(err); }
    });
}

//keyboard input handling
const control = () => {
    let stdin = process.stdin;

    //enter = bad
    stdin.setRawMode(true);

    //resume stdin in the parent process (node app won't quit all by itself unless an error or process.exit() happens)
    stdin.resume();

    //screw binanry
    stdin.setEncoding('utf8');

    //on any data into stdin
    stdin.on('data', function (key) {
        // ctrl-c
        if (key === '\u0003') { process.exit(); }

        switch (key) {
            case keybinds.cam1: //select 1
                console.log("Camera 1 Selected");
                selected = 1;
                break;
            case keybinds.cam2: //select 2
                console.log("Camera 2 Selected");
                selected = 2;
                break;
            case keybinds.cam3: //select 3
                console.log("Camera 3 Selected");
                selected = 3;
                break;
            case keybinds.panLeft: //pan left
                console.log("Commanding Cam " + selected + " to pan left");
                ptz(selected, "left");
                break;
            case keybinds.panRight: //pan right
                console.log("Commanding Cam " + selected + " to pan right");
                ptz(selected, "right");
                break;
            case keybinds.tiltUp: //tilt up
                console.log("Commanding Cam " + selected + " to tilt up");
                ptz(selected, "up");
                break;
            case keybinds.tiltDown: //tilt down
                console.log("Commanding Cam " + selected + " to tilt down");
                ptz(selected, "down");
                break;
            case keybinds.stopAll: //STOP ALL
                console.log("Commanding all cams to stop");
                hault();
                break;
            case keybinds.stop: //STOP 
                console.log("Commanding Cam " + selected + " to stop");
                hault(selected);
                break;
            default:
                console.log("key not assigned");
        }
    });
}

//Fire ptz event
//using event emitter to keep everything async and non-blocking
const ptz = (camera = 1, direction = "left") => {
    eventEmitter.emit("camera_" + camera, direction);
}

//Fire stop event
const hault = (camera = 0) => {
    if (camera == 0) {
        for (let i = 0; i < cameras.length; i++) {
            let id = cameras[i].id;
            eventEmitter.emit("camera_" + id, "stop");
        }
    } else {
        eventEmitter.emit("camera_" + camera, "stop");
    }
}

//Main loop
main();