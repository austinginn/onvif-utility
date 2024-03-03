//Zoom speed limitations of Alfatron 1080p PTZ cameras via ONVI
//by Austin Ginn

import OnvifManager from 'onvif-nvt';


const results = await OnvifManager.connect('192.168.5.163', 2000, 'admin', 'admin');
const camera = results;

console.log(await camera.getInformation());
async function checkPTZMovementCapabilities() {
    try {
        // Get the PTZ node
        const node = await camera.ptz.getNodes();
        console.log('PTZ node:', node.data.GetNodesResponse);
    } catch (error) {
        console.error('Failed to get PTZ node');
    }
}

// checkPTZMovementCapabilities();


//absolute move
async function absoluteMove() {
    try {
        // Move the camera to the specified position
        const position = {
            x: .1,
            y: 0,
            z: .5
        };

        const velocity = {
            x: 1,
            y: 0,
            z: 0,
        };
        await camera.ptz.absoluteMove(null, position, velocity);
    } catch (error) {
        console.log('failed to move');
        // console.error('Failed to move the camera:', error);
    }
}

// absoluteMove();

async function relativeMove(){
    try {
        const translation = {
            x: .1,
            y: 0,
            z: .5
        }
        const velocity = {
            x: 1,
            y: 0,
            z: 0
        }
        await camera.ptz.relativeMove(null, translation,velocity)
    } catch (error) {
        console.log('failed to move');
    }
}

// relativeMove();


async function continuousMove(){
    try {
        const velocity = {
            x: .01,
            y: 0,
            z: 0
        }
        await camera.ptz.continuousMove(null, velocity);
    } catch (error){
        console.log('failed to move');
    }
}

// continuousMove();