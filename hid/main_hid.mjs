//import node-hid
import HID from 'node-hid';
import { EventEmitter } from 'events';

class KeyPad extends EventEmitter {
    constructor(vendorId, productId, keymap) {
        super();
        this.vendorId = vendorId;
        this.productId = productId;
        this.keymap = keymap;
        this.device = null;
        this.previousKeys = new Set();
    }

    connect() {
        //find device
        let devices = HID.devices();
        let deviceInfo = devices.find(device => device.vendorId === this.vendorId && device.productId === this.productId);

        if (!deviceInfo) {
            console.log('Device not found');
            this.emit('notify', 'Device not found');
            return;
        } else {
            console.log("im here");
            this.emit('found', 'Device found');

            //open the device
            this.device = new HID.HID(deviceInfo.path);

            this.device.on('data', this.handleData.bind(this));
            this.device.on('error', err => {
                console.log('in error');
                this.emit('notify', err)
            });
        }
    }

    close() {
        this.device.close();
    }

    handleData(data) {
        let currentKeys = new Set();
        for (let i = 0; i < data.length; i++) {
            if (data[i] !== 0) {
                currentKeys.add(data[i]);
            }
        }

        // Emit key press events
        for (let key of currentKeys) {
            if (!this.previousKeys.has(key)) {
                let keyName = this.keymap[key];
                if (keyName) {
                    // console.log(`${keyName} pressed`);
                    this.emit('keypress', keyName);

                } else {
                    this.emit('keypress', 'unknown');
                }
            }
        }

        //emit key releases events
        for (let key of this.previousKeys) {
            if (!currentKeys.has(key)) {
                let keyName = this.keymap[key];
                if (keyName) {
                    this.emit('keyrelease', keyName);

                } else {
                    this.emit('keyrelease', 'unknown');
                }
            }
        }

        this.previousKeys = currentKeys;
    }
}

export default KeyPad;

// const keypadProfile = {
//     vendorId: 9614,
//     productId: 15,
//     keymap: {
//         0x29: 'escape',
//         0x67: 'equals',
//         0x68: 'openParen',
//         0x69: 'closeParen',
//         0x6a: 'calc',
//         0x2a: 'backspace',
//         0x2b: 'tab',
//         0x4a: 'home',
//         0x4b: 'pgUp',
//         0x53: 'numLock',
//         0x54: 'divide',
//         0x55: 'multiply',
//         0x56: 'subtract',
//         0x4c: 'delete',
//         0x4d: 'end',
//         0x4e: 'pgDown',
//         0x5f: 'seven',
//         0x60: 'eight',
//         0x61: 'nine',
//         0x57: 'add',
//         0x5c: 'four',
//         0x5d: 'five',
//         0x5e: 'six',
//         0x59: 'one',
//         0x5a: 'two',
//         0x5b: 'three',
//         0x58: 'enter',
//         0x62: 'zero',
//         0x63: 'period',
//         0x52: 'upArrow',
//         0x50: 'leftArrow',
//         0x51: 'downArrow',
//         0x4f: 'rightArrow',
//     },
// }

// main();

// //main function
// function main() {
//     //get a list of all connected HID devices
//     let devices = HID.devices();
//     // console.log(devices);

//     //find device by id
//     let deviceInfo = devices.find(device => device.vendorId === keypadProfile.vendorId && device.productId === keypadProfile.productId);

//     if (!deviceInfo) {
//         console.log('Device not found');
//         return;
//     } else {
//         console.log('Device found:', deviceInfo);
//     }

//     //open the device
//     let device = new HID.HID(deviceInfo.path);

//     let previousKeys = new Set();

//     // Set up the data event listener
//     device.on('data', data => {
//         console.log("in device.on loop");
//         console.log('Received data:', data);

//         let currentKeys = new Set();
//         for (let i = 0; i < data.length; i++) {
//             if (data[i] !== 0) {
//                 currentKeys.add(data[i]);
//             }
//         }

//         // Emit key press events
//         for (let key of currentKeys) {
//             if (!previousKeys.has(key)) {
//                 let keyName = keypadProfile.keymap[key];
//                 if (keyName) {
//                     console.log(`${keyName} pressed`);

//                 } else {
//                     console.log('Unknown key pressed:', key);
//                 }
//             }
//         }

//         //emit key releases events
//         for (let key of previousKeys) {
//             if (!currentKeys.has(key)) {
//                 let keyName = keypadProfile.keymap[key];
//                 if (keyName) {
//                     console.log(`${keyName} released`);
//                 } else {
//                     console.log('Unknown key released:', key);
//                 }
//             }
//         }

//         previousKeys = currentKeys;
//     });

//     device.on('error', err => {
//         console.error('Error:', err);
//     });
// }