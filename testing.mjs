//ONVIF PTZ CMD LINE TOOL
//by Austin Ginn

//TODO
//disconnect and reconnect handling
//verbose mode for debugging
//simple ui for connection status
//refactor camera connect function
//key mapping because hardcoding is bad
//move keyboard input handling into a function
import EventEmitter from 'events';
import OnvifManager from 'onvif-nvt';

const eventEmitter = new EventEmitter();

//array of cameras
const cameras = [{
    id: 1,
    name: "Cam1",
    ip: "192.168.1.51",
    port: 2000,
    user: "admin",
    pass: "admin"
}, {
    id: 2,
    name: "Cam2",
    ip: "192.168.1.52",
    port: 2000,
    user: "admin",
    pass: "admin"
}, {
    id: 3,
    name: "Cam3",
    ip: "192.168.1.53",
    port: 2000,
    user: "admin",
    pass: "admin"
}]

const VELOCITY = .01; // multiply by -1 depending on direction
const MAX_CONNECTION_ATTEMPTS = 5;

let selected = 1; //current selected camera id -- default to 1

//Main because async...
const main = async () => {
    //////////////////////////
    //GLOBAL EVENT LISTENERS//
    //////////////////////////
    eventEmitter.on("message", (msg) => {
        console.log(msg);
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
    //Handle keyboard input
    let stdin = process.stdin;

    //Enter = bad
    stdin.setRawMode(true);

    //resume stdin in the parent process (node app won't quit all by itself unless an error or process.exit() happens)
    stdin.resume();

    //Screw binanry
    stdin.setEncoding('utf8');

    //On any data into stdin
    stdin.on('data', function (key) {
        // ctrl-c ( end of text )
        if (key === '\u0003') {
            process.exit();
        }

        switch (key) {
            case '1': //select 1
                console.log("Camera 1 Selected");
                selected = 1;
                break;
            case '2': //select 2
                console.log("Camera 2 Selected");
                selected = 2;
                break;
            case '3': //select 3
                console.log("Camera 3 Selected");
                selected = 3;
                break;
            case 'a': //pan left
                console.log("Commanding Cam " + selected + " to pan left");
                ptz(selected, "left");
                break;
            case 'd': //pan right
                console.log("Commanding Cam " + selected + " to pan right");
                ptz(selected, "right");
                break;
            case 'w': //tilt up
                console.log("Commanding Cam " + selected + " to tilt up");
                ptz(selected, "up");
                break;
            case 's': //tilt down
                console.log("Commanding Cam " + selected + " to tilt down");
                ptz(selected, "up");
                break;
            case 'z': //STOP ALL
                console.log("Commanding all cams to stop");
                hault();
                break;
            case 'x': //STOP ALL
                console.log("Commanding Cam " + selected + " to stop");
                hault(selected);
                break;
            default:
                console.log("key not assigned");
        }
    });
}

//Connect to a camera and handle events
//currently no reconnect trys on a disconnect
//onvif dependency connection timeout is unknown (but seems to indefinitely attempt connection)
//test disconnect cases and then handle them in a catch block for reconnect functionality
const connect = async (ip, port = 2000, user = "admin", pass = "admin", id, attempt = 0) => {
    //connect
    try{
        let onvif = new OnvifManager; //documentation not clear if this actually handles multiple connection of if you need a seperate object for each connection
        let cam = await onvif.connect(ip, port, user, pass);
        console.log(cam);
    } catch(err){ //catch block for initial onvif connection failure
        // console.log(err); 
        attempt++;
        console.log(ip + ":" + port +  " | Connection attempt #" + attempt);
        
        if(attempt < MAX_CONNECTION_ATTEMPTS){
            connect(ip, port, user, pass, id, attempt);
        
        } else {
            console.log(ip + ":" + port +  " | Connection failed");
        }
        return -1;
    }
    
    eventEmitter.emit("message", "Camera " + id + ": Connected!");

    //set up camera event handling here
    //

    if (cam.ptz) { //PTZ is supported
        //PTZ event handling
        let direction = { x: 0, y: 0, z: 0 } //no movement
        eventEmitter.on("camera_" + id, async (cmd) => {
            try {
                switch (cmd) {
                    case "stop":
                        await cam.ptz.stop();
                        break;
                    case "left":
                        direction = { x: VELOCITY, y: 0, z: 0 }; //left
                        await cam.ptz.continuousMove(null, direction);
                        break;
                    case "right":
                        direction = { x: VELOCITY * -1, y: 0, z: 0 }; //right
                        await cam.ptz.continuousMove(null, direction);
                        break;
                    case "up":
                        direction = { x: 0, y: VELOCITY, z: 0 }; //up
                        await cam.ptz.continuousMove(null, direction);
                        break;
                    case "down":
                        direction = { x: 0, y: VELOCITY * -1, z: 0 }; //up
                        await cam.ptz.continuousMove(null, direction);
                        break;
                    default:
                        break;
                }
            } catch (err) { console.log(err); }
        });
    }
}

//Fire ptz event
//using event emitter to keep everything async and non-blocking
const ptz = (camera = 1, direction = "left") => {
    eventEmitter.emit("camera_" + camera, direction);
}

//Fire stop event
const hault = (camera = 0) => {
    if (camera == 0) {
        eventEmitter.emit("camera_" + 1, "stop");
        eventEmitter.emit("camera_" + 2, "stop");
        eventEmitter.emit("camera_" + 3, "stop");
    } else {
        eventEmitter.emit("camera_" + camera, "stop");
    }
}

//Main loop
main();