import KeyPad from './main_hid.mjs';
import ViscaController from './visca.mjs';
import { Atem } from 'atem-connection';

import { keypadConfig } from './config/keypadConfig.mjs';
import { cameraConfig } from './config/cameraConfig.mjs';

switcherIP = '192.168.40.12';


main();

async function main() {
    console.log('Initializing devices...');

    const [ HID, ATEM] = await Promise.all([
        initHID(),
        initAtem()
    ]);

    //init visca
    const CAMERAS = initVisca();

    console.log('Devices initialized!');

    ///////////////
    //HID listeners
    ///////////////
    const errorHandlerHID = error => {
        console.error('Error:', error);
    }

    const keypressHandler = key => {
        console.log('Key pressed:', key);
    }

    const keyreleaseHandler = key => {
        console.log('Key released:', key);
    }

    HID.on('error', errorHandlerHID);
    HID.on('keypress', keypressHandler);
    HID.on('keyrelease', keyreleaseHandler);

    ///////////////
    //ATEM listeners
    ///////////////
    const errorHandlerATEM = error => {
        console.error('Error:', error);
    }

    ATEM.on('error', errorHandlerATEM);
}


async function initHID() {
    let timer = null;
    let device = new KeyPad(keypadConfig.vendorId, keypadConfig.productId, keypadConfig.keymap);


    const errorHandler = error => {
        console.error('Error:', error);
    }

    const foundHandler = message => {
        console.log('Checking application control. Press a key on the keypad...');
        timer = setTimeout(() => {
            console.log('Application does not have control of the device. Retrying...');
            device.close();
            device.removeAllListeners();
            device = null;
            initHID();
        }, 5000);
    }

    const keyReleaseHandler = key => {
        clearTimeout(timer);
        console.log('Application control confirmed!');
        console.log('Releasing listeners...');
        device.removeListener('error', errorHandler);
        device.removeListener('found', foundHandler);
        device.removeListener('keyrelease', keyReleaseHandler);

        //resolve the promise
        return new Promise((resolve, reject) => {
            resolve(device);
        });
    }

    device.on('yo', errorHandler);
    device.on('found', foundHandler);
    device.on('keyrelease', keyReleaseHandler);
    device.connect();
}

async function initAtem() {
    const atem = new Atem();

    const errorHandlerAtem = error => {
        console.error('Error:', error);
    }

    const connectedHandler = () => {
        console.log('Connected to ATEM Switcher');
        atem.removeListener('error', errorHandlerAtem);
        atem.removeListener('connected', connectedHandler);
        return new Promise((resolve, reject) => {
            resolve(atem);
        });
    }

    atem.on('error', errorHandlerAtem);
    atem.on('connected', connectedHandler);
    atem.connect(switcherIP);
}

function initVisca() {
    // Initialize Visca controllers
    let cameras = [];

    for(let i = 0; i < cameraConfig.length; i++) {
        const camera = new ViscaController(cameraConfig[i].ipAddress, cameraConfig[i].port);

        //Create listeners for each camera
        camera.on('response', (msg, rinfo) => {
            console.log(`Received response from ${rinfo.address}:${rinfo.port}: ${msg}`);
        });

        camera.on('error', (err) => {
            console.error('An error occurred:', err);
        });

        cameras.push(camera);
    }

    return cameras;
}