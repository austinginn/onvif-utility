import { sanctuaryConfig } from "../config/sanctuaryConfig.mjs";
import PanasonicController from "../protocols/panasonic.mjs";
import { Atem } from 'atem-connection';

export default class sancProfile {
    constructor() {
        this.selectedCamera = 1; //current selected camera
        this.queue = false; //queue next camera
        this.selectedPreset = 1; //current selected preset
        this.selectedQueueCamera = 1; //camera to run in queue
        this.selectedQueuePrleset = 1; //preset to run in queue
        this.modifier = false; //modifier key status
        this.saveModifier = false; //save modifier key status
        this.cameraConfig = sanctuaryConfig.cameras;
        this.switcherConfig = sanctuaryConfig.switchers;
        this.TILT_SPEED = sanctuaryConfig.TILT_SPEED;
        this.PAN_SPEED = sanctuaryConfig.PAN_SPEED;
    }

    async connectToDevices() {
        this.cameras = this.#initPanasonic(this.cameraConfig);
        this.atem = await this.#initAtem(this.switcherConfig);
        this.atem[0].on('stateChanged', (state, pathToChange) => {
            console.log('stateChanged', state, pathToChange);
        });
        return;
    }

    #initPanasonic(config) {
        let cameras = [];
        config.forEach(camera => {
            let cam = new PanasonicController(camera.ip);
            cameras.push(cam);
        });

        return cameras;
    }

    #initAtem(conf) {
        let switcherPromises = [];

        for (let i = 0; i < conf.length; i++) {
            const atem = new Atem();
            const errorHandlerAtem = error => {
                console.error('Error:', error);
            }

            const switcherPromise = new Promise((resolve, reject) => {
                const connectedHandler = () => {
                    console.log('Connected to ATEM Switcher');
                    atem.removeListener('error', errorHandlerAtem);
                    atem.removeListener('connected', connectedHandler);
                    resolve(atem);
                }

                atem.on('error', errorHandlerAtem);
                atem.on('connected', connectedHandler);
                atem.connect(conf[i].ip);
            });

            switcherPromises.push(switcherPromise);
        }

        return Promise.all(switcherPromises);
    }

    #isLive(selected) {
        const cameraToAtemMap = {
            1: 3,
            2: 5
        }

        if (cameraToAtemMap[selected] === this.atem[0].state.video.mixEffects[0].programInput) {
            return true;
        }

        return false;
    }

    #handlePreset(presetNumber) {
        console.log("presetNumber", presetNumber);
        console.log("selectedCamera - 1", this.selectedCamera - 1);
        console.log(this.cameras[this.selectedCamera - 1]);
        if (this.saveModifier) {
            console.log(`Cam ${this.selectedCamera}: saving to preset ${presetNumber}.`);
            this.cameras[this.selectedCamera - 1].savePreset(presetNumber);
        } else if (!this.queue) {
            if (!this.#isLive(this.selectedCamera)) {
                console.log(`Cam ${this.selectedCamera}: recalling preset ${presetNumber}.`);
                this.cameras[this.selectedCamera - 1].recallPreset(presetNumber);
            }
        } else {
            console.log(`Cam ${this.selectedCamera}: preset ${presetNumber} queued.`);
            this.selectedQueuePreset = presetNumber;
            this.selectedQueueCamera = this.selectedCamera;
        }
    }

    handleKeypress(key) {
        switch (key) {
            case 'home': // send cameras to home position
                if (this.modifier) {
                    for (let i = 0; i < this.cameras.length; i++) {
                        console.log(`Cam ${i + 1}: go home.`);
                        if (!this.#isLive(i + 1)) {
                            //send to home
                            this.cameras[i].home();
                        }
                    }
                } else {
                    console.log(`Cam ${this.selectedCamera}: go home.`);
                    if (!this.#isLive(selected)) {
                        //send home
                        this.cameras[this.selectedCamera - 1].home();
                    }
                }
                break;
            case 'upArrow': // tilt camera up
                console.log(`Cam ${this.selectedCamera}: tilt up.`);
                this.cameras[this.selectedCamera - 1].tiltUp(this.TILT_SPEED);
                break;
            case 'downArrow': // tilt camera down
                console.log(`Cam ${this.selectedCamera}: tilt down.`);
                this.cameras[this.selectedCamera - 1].tiltDown(this.TILT_SPEED);
                break;
            case 'leftArrow': // pan camera left
                console.log(`Cam ${this.selectedCamera}: pan left.`);
                this.cameras[this.selectedCamera - 1].panLeft(this.PAN_SPEED);
                break;
            case 'rightArrow': // pan camera right
                console.log(`Cam ${this.selectedCamera}: pan right.`);
                this.cameras[this.selectedCamera - 1].panRight(this.PAN_SPEED);
                break;
            case 'end': // stop camera movement
                if (this.modifier) {
                    for (let i = 0; i < this.cameras.length; i++) {
                        console.log(`Cam ${i + 1}: stopping.`);
                        this.cameras[i].stopPT(); //stop pt
                        //stop zoom
                        this.cameras[i].stopZ(); //stop zoom
                    }
                } else {
                    console.log(`Cam ${this.selectedCamera}: stopping.`);
                    this.cameras[this.selectedCamera - 1].stopPT(); //stop pt
                    // this.cameras[this.selectedCamera - 1]. //stop zoom
                }
                break;
            case 'period': //turn on
                this.queue = true;
                console.log(`Queue mode: ${this.queue}`);
                break;
            case 'enter': //run queue
                console.log(`Cam ${this.selectedQueueCamera}: running queue.`);
                this.cameras[this.selectedQueueCamera - 1].recallPreset(this.selectedQueuePreset);
                break;
            case 'numLock': //select cam 1
                this.selectedCamera = 1;
                // this.atem[0].setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 18 }, 0);
                console.log(`Cam ${this.selectedCamera}: selected.`);
                break;
            case 'divide': //select cam 2
                this.selectedCamera = 2;
                // this.atem[0].setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 19 }, 0);
                console.log(`Cam ${this.selectedCamera}: selected.`);
                break;
            case 'multiply': //select cam 3
                // this.selectedCamera = 3;
                // // this.atem[0].setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 20 }, 0);
                // console.log(`Cam ${this.selectedCamera}: selected.`);
                break;
            case 'one': //preset one
                this.#handlePreset(1);
                break;
            case 'two': //preset two
                this.#handlePreset(2);
                break;
            case 'three': //preset three
                this.#handlePreset(3);
                break;
            case 'four': //preset four
                this.#handlePreset(4);
                break;
            case 'five': //preset five
                this.#handlePreset(5);
                break;
            case 'six': //preset six
                this.#handlePreset(6);
                break;
            case 'seven': //preset seven
                this.#handlePreset(7);
                break;
            case 'eight': //preset eight
                this.#handlePreset(8);
                break;
            case 'nine': //preset nine
                this.#handlePreset(9);
                break;
            case 'tab': //modifier key
                console.log('Modifier key pressed.')
                this.modifier = true;
                break;
            case 'pgUp': //zoom in
                console.log(`Cam ${this.selectedCamera}: zoom in.`);
                //this.cameras[this.selectedCamera - 1].zoomIn();
                break;
            case 'pgDn': //zoom out
                //console.log(`Cam ${this.selectedCamera}: zoom out.`);
                this.cameras[this.selectedCamera - 1].zoomOut();
                break;
            case 'zero':
                //save modifier
                this.saveModifier = true;
                console.log('Save modifier pressed.');
                break;
            default:
                break;
        }
    }

    handleKeyrelease(key) {
        switch (key) {
            case 'tab': //modifier key
                console.log('Modifier key released.')
                this.modifier = false;
                break;
            case 'zero':
                //save modifier
                this.saveModifier = false;
                console.log('Save modifier released.');
                break;
            case 'period':
                this.queue = false;
                console.log("Queue mode off.");
                break;
            default:
                break;
        }
    }
}