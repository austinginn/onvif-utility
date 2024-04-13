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