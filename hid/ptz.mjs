import { processSlotOutlet } from '@vue/compiler-core';
import KeyPad from './main_hid.mjs';
import ViscaController from './visca.mjs';

let confirmed = false;
let device = null;
let timer = null;

const keypadProfile = {
    vendorId: 9614,
    productId: 15,
    keymap: {
        0x29: 'escape',
        0x67: 'equals',
        0x68: 'openParen',
        0x69: 'closeParen',
        0x6a: 'calc',
        0x2a: 'backspace',
        0x2b: 'tab',
        0x4a: 'home',
        0x4b: 'pgUp',
        0x53: 'numLock',
        0x54: 'divide',
        0x55: 'multiply',
        0x56: 'subtract',
        0x4c: 'delete',
        0x4d: 'end',
        0x4e: 'pgDown',
        0x5f: 'seven',
        0x60: 'eight',
        0x61: 'nine',
        0x57: 'add',
        0x5c: 'four',
        0x5d: 'five',
        0x5e: 'six',
        0x59: 'one',
        0x5a: 'two',
        0x5b: 'three',
        0x58: 'enter',
        0x62: 'zero',
        0x63: 'period',
        0x52: 'upArrow',
        0x50: 'leftArrow',
        0x51: 'downArrow',
        0x4f: 'rightArrow',
    },
}

const cameraConfig = [
    { 
        name: "Left Cam",
        ip: "",
        port: 52381
    },
    {
        name: "Right Cam",
        ip: "",
        port: 52381
    },
    {
        name: "Mid Cam",
        ip: "",
        port: 52381
    }
]



main();

async function main() {
    await init();
    console.log("HID connection established.");
    console.log("Connecting to cameras");
    for(let i = 0; i < cameraConfig.length; i++ ){
        cameraConfig[i].camera = new ViscaController(cameraConfig[i].ip, cameraConfig[i].port);
        
        //listeners
        cameraConfig[i].camera.on('response', (msg, rinfo) => {
            console.log(`Received response from ${rinfo.address}:${rinfo.port}: ${msg}`);
        });

        cameraConfig[i].camera.on('error', (err) => {
            console.error('An error occurred:', err);
        });

        cameraConfig[i].camera.on('commandSent', (command) => {
            console.log('Command sent successfully:', command);
        });
    }
}

// This function is used to initialize the connection to the keypad device.
// Sometimes other application/OS takes control of the device
// so we retry until we get control. Haven't tested other OSes.
// How do we gurantee that node-hid gets control everytime?????
function init() {
    device = new KeyPad(keypadProfile.vendorId, keypadProfile.productId, keypadProfile.keymap);

    device.on('yo', error => {
        console.error('Error:', error);
    });

    device.on('found', message => {
        //check if application has control of the device
        console.log('Checking application control. Press a key on the keypad.');
        timer = setTimeout(() => {
            console.log('Application does not have control of the device. Retrying...');
            device.close();
            device = null;
            init();
        }, 5000);
    });

    device.on('keypress', key => {
        if (!confirmed) {
            return;
        } else {
            console.log('Key pressed:', key);
        }
    });

    device.on('keyrelease', key => {
        if (!confirmed) {
            clearTimeout(timer);
            confirmed = true;
            console.log('Application control confirmed!');
            return new Promise((resolve, reject) => {
                resolve('control');
            });
        } else {
            console.log('Key released:', key);
        }
    });
    
    device.connect();
}