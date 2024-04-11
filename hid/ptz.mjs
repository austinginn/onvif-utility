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
        name: "Mid Cam",
        ip: "192.168.5.163",
        port: 52381
    },
    {
        name: "Left Cam",
        ip: "192.168.5.164",
        port: 52381
    },
    {
        name: "Right Cam",
        ip: "192.168.5.165",
        port: 52381
    }
]

let selected = 1;
let run = true;
let selectedPreset = 1;
let selectedRunCamera = 1;
let modifier = false;
let save = false;



main();

async function main() {
    await init();
    console.log("HID connection established.");
    console.log("Connecting to cameras");
    for (let i = 0; i < cameraConfig.length; i++) {
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

            //switch on each keypress
            switch (key) {
                case 'subtract':
                    //AF
                    //81 01 04 38 03 FF
                    if (modifier) {
                        for (let i = 0; i < cameraConfig.length; i++) {
                            console.log('Auto Focus:', cameraConfig[i].name);
                            cameraConfig[i].camera.sendViscaCommand('8101043802FF');
                        }
                    } else {
                        console.log('Auto Focus:', cameraConfig[selected - 1].name);
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101043802FF');
                    }
                    break;
                case 'add':
                    //one push AF
                    //8101043804FF
                    if (modifier) {
                        for (let i = 0; i < cameraConfig.length; i++) {
                            console.log('One Push Focus:', cameraConfig[i].name);
                            cameraConfig[i].camera.sendViscaCommand('8101043804FF');
                        }
                    } else {
                        console.log('One Push Focus:', cameraConfig[selected - 1].name);
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101043804FF');
                    }
                    break;
                case 'home':
                    if (modifier) {
                        for (let i = 0; i < cameraConfig.length; i++) {
                            console.log('Go Home:', cameraConfig[i].name);
                            cameraConfig[i].camera.sendViscaCommand('81010604FF');
                        }
                    } else {
                        console.log('Go Home:', cameraConfig[selected - 1].name);
                        cameraConfig[selected - 1].camera.sendViscaCommand('81010604FF');
                    }
                    break;
                case 'upArrow':
                    //81 01 06 01 VV WW 03 01 FF
                    cameraConfig[selected - 1].camera.sendViscaCommand('8101060101010301FF');
                    break;
                case 'downArrow':
                    //81 01 06 01 VV WW 03 02 FF
                    cameraConfig[selected - 1].camera.sendViscaCommand('8101060101010302FF');
                    break;
                case 'leftArrow':
                    //81 01 06 01 VV WW 01 03 FF
                    cameraConfig[selected - 1].camera.sendViscaCommand('8101060101010103FF');
                    break;
                case 'rightArrow':
                    //81 01 06 01 VV WW 02 03 FF
                    cameraConfig[selected - 1].camera.sendViscaCommand('8101060101010203FF');
                    break;
                case 'end':
                    if (modifier) {
                        for (let i = 0; i < cameraConfig.length; i++) {
                            console.log('Stopping Camera:', cameraConfig[i].name);
                            cameraConfig[i].camera.sendViscaCommand('8101060101010303FF');
                            //stop zoom
                            cameraConfig[i].camera.sendViscaCommand('8101040700FF');
                        }
                    } else {
                        console.log('Stopping Camera:', cameraConfig[selected - 1].name);
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101060101010303FF');
                        //stop zoom
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101040700FF');
                    }
                    break;
                case 'period':
                    run = !run;
                    break;
                case 'enter':
                    cameraConfig[selectedRunCamera - 1].camera.recallPreset(selectedPreset);
                    break;
                case 'numLock':
                    selected = 1;
                    break;
                case 'divide':
                    selected = 2;
                    break;
                case 'multiply':
                    selected = 3;
                    break;
                case 'one':
                    if (save) {
                        //save preset
                        //81 01 04 3F 01 pp FF
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101043F0101FF');
                        break;
                    }
                    if (run) {
                        cameraConfig[selected - 1].camera.recallPreset(1);
                    } else {
                        selectedPreset = 1;
                        selectedRunCamera = selected;
                    }
                    break;
                case 'two':
                    if (save) {
                        //save preset
                        //81 01 04 3F 01 pp FF
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101043F0102FF');
                        break;
                    }
                    if (run) {
                        cameraConfig[selected - 1].camera.recallPreset(2);
                    } else {
                        selectedPreset = 2;
                        selectedRunCamera = selected;
                    }
                    break;
                case 'three':
                    if (save) {
                        //save preset
                        //81 01 04 3F 01 pp FF
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101043F0103FF');
                        break;
                    }
                    if (run) {
                        cameraConfig[selected - 1].camera.recallPreset(3);
                    } else {
                        selectedPreset = 3;
                        selectedRunCamera = selected;
                    }
                    break;
                case 'four':
                    if (save) {
                        //save preset
                        //81 01 04 3F 01 pp FF
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101043F0104FF');
                        break;
                    }
                    if (run) {
                        cameraConfig[selected - 1].camera.recallPreset(4);
                    } else {
                        selectedPreset = 4;
                        selectedRunCamera = selected;
                    }
                    break;
                case 'five':
                    if (save) {
                        //save preset
                        //81 01 04 3F 01 pp FF
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101043F0105FF');
                        break;
                    }
                    if (run) {
                        cameraConfig[selected - 1].camera.recallPreset(5);
                    }
                    else {
                        selectedPreset = 5;
                        selectedRunCamera = selected;
                    }
                    break;
                case 'six':
                    if (save) {
                        //save preset
                        //81 01 04 3F 01 pp FF
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101043F0106FF');
                        break;
                    }
                    if (run) {
                        cameraConfig[selected - 1].camera.recallPreset(6);
                    } else {
                        selectedPreset = 6;
                        selectedRunCamera = selected;
                    }
                    break;
                case 'seven':
                    if (save) {
                        //save preset
                        //81 01 04 3F 01 pp FF
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101043F0107FF');
                        break;
                    }
                    if (run) {
                        cameraConfig[selected - 1].camera.recallPreset(7);
                    } else {
                        selectedPreset = 7;
                        selectedRunCamera = selected;
                    }
                    break;
                case 'eight':
                    if (save) {
                        //save preset
                        //81 01 04 3F 01 pp FF
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101043F0108FF');
                        break;
                    }
                    if (run) {
                        cameraConfig[selected - 1].camera.recallPreset(8);
                    } else {
                        selectedPreset = 8;
                        selectedRunCamera = selected;
                    }
                    break;
                case 'nine':
                    if (save) {
                        //save preset
                        //81 01 04 3F 01 pp FF
                        cameraConfig[selected - 1].camera.sendViscaCommand('8101043F0109FF');
                        break;
                    }
                    if (run) {
                        cameraConfig[selected - 1].camera.recallPreset(9);
                    } else {
                        selectedPreset = 9;
                        selectedRunCamera = selected;
                    }
                    break;
                case 'tab':
                    modifier = true;
                    break;
                case 'pgUp':
                    //zoom in
                    //81 01 04 07 2p FF
                    cameraConfig[selected - 1].camera.sendViscaCommand('8101040720FF');
                    break;
                case 'pgDown':
                    //zoom out
                    //81 01 04 07 3p FF
                    cameraConfig[selected - 1].camera.sendViscaCommand('8101040730FF');
                    break;
                case 'zero':
                    //save modifier
                    save = true;
                    console.log('Save modifier:', save);
                    break;
                default:
                    break;
            }
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
            switch (key) {
                case 'tab':
                    modifier = false;
                    break;
                case 'zero':
                    save = false;
                    console.log('Save modifier:', save);
                    break;
                default:
                    break
            }
        }
    });

    device.connect();
}