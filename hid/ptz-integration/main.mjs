import KeyPad from '../main_hid.mjs';
import { keypadConfig } from './config/keypadConfig.mjs';

const profileName = process.argv[2];

main({
    latencyCalcInterval: 30000,
    Profile: profileName,
    keypadConfig,
});

async function main({ latencyCalcInterval, Profile, keypadConfig }) {
    //init HID
    console.log('Initializing HID...');

    const HID = await initHID(keypadConfig);
    console.log(HID);

    //init profile
    const ProfileModule = await import(`./profiles/${Profile}.mjs`); // dynamic import
    let profile = new ProfileModule.default();
    await profile.connectToDevices();

    ///////////////
    //Profile latency
    ///////////////
    let latency;
    let latencies = [];
    const maxLatencies = 5;

    setInterval(() => {
        // Calculate the average latency
        let averageLatency = 0;
        if (latencies.length > 0) {
            averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        }
        console.log(`Average Profile Execution Latency: ${averageLatency}ms `);
    }, latencyCalcInterval);


    ///////////////
    //HID listeners
    ///////////////
    const errorHandlerHID = error => {
        console.error('Error:', error);
    }

    const keypressHandler = key => {
        console.log('Key pressed:', key);
        const start = Date.now();
        profile.handleKeypress(key);
        const end = Date.now();

        latency = end - start;
        if(latencies.length >= maxLatencies){
            latencies.shift();
        }
        latencies.push(latency);
    }

    const keyreleaseHandler = key => {
        console.log('Key released:', key);
        profile.handleKeyrelease(key);
    }

    HID.on('error', errorHandlerHID);
    HID.on('keypress', keypressHandler);
    HID.on('keyrelease', keyreleaseHandler);

}


async function initHID(keypadConfig) {
    return new Promise((resolve, reject) => {
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
                resolve(initHID(keypadConfig));
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
            resolve(device);

        }

        device.on('yo', errorHandler);
        device.on('found', foundHandler);
        device.on('keyrelease', keyReleaseHandler);
        device.connect();
    });
}