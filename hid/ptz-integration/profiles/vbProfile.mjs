import { vbConfig } from '../config/vbConfig.mjs';
import ViscaController from '../protocols/visca.mjs';
import { Atem } from 'atem-connection';

export default class vbProfile {
    constructor() {
        this.selectedCamera = 1; //current selected camera
        this.queue = false; //queue next camera
        this.selectedPreset = 1; //current selected preset
        this.selectedQueueCamera = 1; //camera to run in queue
        this.selectedQueuePrleset = 1; //preset to run in queue
        this.modifier = false; //modifier key status
        this.saveModifier = false; //save modifier key status
        this.cameraConfig = vbConfig.cameras;
        this.switcherConfig = vbConfig.switchers;
        this.selectLink = false;
    }

    async connectToDevices() {
        this.cameras = this.#initVisca(this.cameraConfig);
        this.atem = await this.#initAtem(this.switcherConfig);
        console.log(this.atem[0].state.video.mixEffects[0].programInput);
        // this.atem[0].on('stateChanged', (state, pathToChange) => {
        //     console.log('stateChanged', pathToChange, state);
        // });
        return;
    }

    #initVisca(conf) {
        let cameras = [];
        for (let i = 0; i < conf.length; i++) {
            // console.log(conf[i]);
            const camera = new ViscaController(conf[i].ip, conf[i].port);

            //Create listeners for each camera
            // camera.on('response', (msg, rinfo) => {
            //     console.log(`Received response from ${rinfo.address}:${rinfo.port}: ${msg}`);
            // });

            camera.on('error', (err) => {
                console.error('An error occurred:', err);
            });



            cameras.push(camera);
        }

        return cameras;
    }

    #initAtem(conf) {
        let switcherPromises = [];

        for (let i = 0; i < conf.length; i++) {
            const atem = new Atem();
            const errorHandlerAtem = error => {
                console.error('Error:', error);
            }
            const stateChangedHandler = (state, pathToChange) => {
                console.log('stateChanged', pathToChange, state);
            };

            const switcherPromise = new Promise((resolve, reject) => {
                const connectedHandler = () => {
                    console.log('Connected to ATEM Switcher');
                    atem.removeListener('error', errorHandlerAtem);
                    atem.removeListener('connected', connectedHandler);
                    atem.removeListener('stateChanged', stateChangedHandler);
                    resolve(atem);
                }

                atem.on('error', errorHandlerAtem);
                atem.on('connected', connectedHandler);
                atem.on('stateChanged', stateChangedHandler);
                atem.connect(conf[i].ip);
            });

            switcherPromises.push(switcherPromise);
        }

        return Promise.all(switcherPromises);
    }

    handleKeypress(key) {
        switch (key) {
            case 'home': // send cameras to home position
                if (this.modifier) {
                    for (let i = 0; i < this.cameras.length; i++) {
                        console.log(`Cam ${i + 1}: go home.`);
                        if (i != this.atem[0].state.video.mixEffects[0].programInput) {
                            this.cameras[i].sendViscaCommand('81010604FF');
                        }

                    }
                } else {
                    console.log(`Cam ${this.selectedCamera}: go home.`);
                    if (this.selectedCamera - 1 != this.atem[0].state.video.mixEffects[0].programInput) {
                        this.cameras[this.selectedCamera - 1].sendViscaCommand('81010604FF');
                    }

                }
                break;
            case 'upArrow': // tilt camera up
                if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                    console.log(`Cam ${this.selectedCamera}: tilt up.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101060101010301FF');
                }
                break;
            case 'downArrow': // tilt camera down
                if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                    console.log(`Cam ${this.selectedCamera}: tilt down.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101060101010302FF');
                }
                break;
            case 'leftArrow': // pan camera left
                if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                    console.log(`Cam ${this.selectedCamera}: pan left.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101060101010103FF');
                }
                break;
            case 'rightArrow': // pan camera right
                if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                    console.log(`Cam ${this.selectedCamera}: pan right.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101060101010203FF');
                }
                break;
            case 'end': // stop camera movement
                if (this.modifier) {
                    for (let i = 0; i < this.cameras.length; i++) {
                        console.log(`Cam ${i + 1}: stopping.`);
                        this.cameras[i].sendViscaCommand('8101060101010303FF'); //stop pt
                        this.cameras[i].sendViscaCommand('8101040700FF'); //stop zoom
                    }
                } else {
                    console.log(`Cam ${this.selectedCamera}: stopping.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101060101010303FF'); //stop pt
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101040700FF'); //stop zoom
                }
                break;
            // case 'period': //turn on
            //     this.queue = true;
            //     console.log(`Queue mode: ${this.queue}`);
            //     break;
            // case 'enter': //run queue
            //     console.log(`Cam ${this.selectedQueueCamera}: running queue.`);
            //     this.cameras[this.selectedQueueCamera - 1].recallPreset(this.selectedQueuePreset);
            //     break;
            case 'numLock': //select cam 1
                this.selectedCamera = 1;
                if(this.selectLink){
                    this.atem[0].changePreviewInput(1, 0);
                }
                this.atem[0].setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 18 }, 0);
                console.log(`Cam ${this.selectedCamera}: selected.`);
                break;
            case 'divide': //select cam 2
                this.selectedCamera = 2;
                if(this.selectLink){
                    this.atem[0].changePreviewInput(2, 0);
                }
                this.atem[0].setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 19 }, 0);
                console.log(`Cam ${this.selectedCamera}: selected.`);
                break;
            case 'multiply': //select cam 3
                this.selectedCamera = 3;
                if(this.selectLink){
                    this.atem[0].changePreviewInput(3, 0);
                }
                this.atem[0].setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 20 }, 0);
                console.log(`Cam ${this.selectedCamera}: selected.`);
                break;
            case 'subtract': //disolve into propresenter
                console.log("disolve into propresenter");
                this.atem[0].changePreviewInput(7, 0);
                setTimeout(() => {
                    this.atem[0].autoTransition(0);
                }, 200);
                break;
            case 'add': //dissolve
                console.log("dissolve");
                this.atem[0].autoTransition(0);
                break;
            case 'enter': //cut
                console.log("cut");
                this.atem[0].cut(0);
                break;
            case 'openParen': //preview mid cam
                console.log(`Cam Mid: preview.`);
                this.atem[0].changePreviewInput(1, 0);
                break;
            case 'closeParen': //preview Left cam
                console.log(`Cam Left: preview.`);
                this.atem[0].changePreviewInput(2, 0);
                break;
            case 'calc': //preview right cam
                console.log(`Cam Right: preview.`);
                this.atem[0].changePreviewInput(3, 0);
                break;
            case 'backspace': //preview propresenter
                console.log(`ProPresenter: preview.`);
                this.atem[0].changePreviewInput(7, 0);
                break;
            case 'one': //preset one
                if (this.saveModifier) {
                    //save preset
                    console.log(`Cam ${this.selectedCamera}: saving to preset 1.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101043F0101FF');
                    break;
                }
                if (!this.queue) {
                    if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                        console.log(`Cam ${this.selectedCamera}: recalling preset 1.`);
                        this.cameras[this.selectedCamera - 1].recallPreset(1);
                    }

                } else {
                    console.log(`Cam ${this.selectedCamera}: preset 1 queued.`);
                    this.selectedQueuePreset = 1;
                    this.selectedQueueCamera = this.selectedCamera;
                }
                break;
            case 'two': //preset two
                if (this.saveModifier) {
                    //save preset
                    console.log(`Cam ${this.selectedCamera}: saving to preset 2.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101043F0102FF');
                    break;
                }
                if (!this.queue) {
                    console.log(this.selectedCamera, this.atem[0].state.video.mixEffects[0].programInput)
                    if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                        console.log(`Cam ${this.selectedCamera}: recalling preset 2.`);
                        this.cameras[this.selectedCamera - 1].recallPreset(2);
                    }

                } else {
                    console.log(`Cam ${this.selectedCamera}: preset 2 queued.`);
                    this.selectedQueuePreset = 2;
                    this.selectedQueueCamera = this.selectedCamera;
                }
                break;
            case 'three': //preset three
                if (this.saveModifier) {
                    //save preset
                    console.log(`Cam ${this.selectedCamera}: saving to preset 3.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101043F0103FF');
                    break;
                }
                if (!this.queue) {
                    if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                        console.log(`Cam ${this.selectedCamera}: recalling preset 3.`);
                        this.cameras[this.selectedCamera - 1].recallPreset(3);
                    }

                } else {
                    console.log(`Cam ${this.selectedCamera}: preset 3 queued.`);
                    this.selectedQueuePreset = 3;
                    this.selectedQueueCamera = this.selectedCamera;
                }
                break;
            case 'four': //preset four
                if (this.saveModifier) {
                    //save preset
                    console.log(`Cam ${this.selectedCamera}: saving to preset 4.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101043F0104FF');
                    break;
                }
                if (!this.queue) {
                    if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                        console.log(`Cam ${this.selectedCamera}: recalling preset 4.`);
                        this.cameras[this.selectedCamera - 1].recallPreset(4);
                    }
                } else {
                    console.log(`Cam ${this.selectedCamera}: preset 4 queued.`);
                    this.selectedQueuePreset = 4;
                    this.selectedQueueCamera = this.selectedCamera;
                }
                break;
            case 'five': //preset five
                if (this.saveModifier) {
                    //save preset
                    console.log(`Cam ${this.selectedCamera}: saving to preset 5.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101043F0105FF');
                    break;
                }
                if (!this.queue) {
                    if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                        console.log(`Cam ${this.selectedCamera}: recalling preset 5.`);
                        this.cameras[this.selectedCamera - 1].recallPreset(5);
                    }

                } else {
                    console.log(`Cam ${this.selectedCamera}: preset 5 queued.`);
                    this.selectedQueuePreset = 5;
                    this.selectedQueueCamera = this.selectedCamera;
                }
                break;
            case 'six': //preset six
                if (this.saveModifier) {
                    //save preset
                    console.log(`Cam ${this.selectedCamera}: saving to preset 6.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101043F0106FF');
                    break;
                }
                if (!this.queue) {
                    if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                        console.log(`Cam ${this.selectedCamera}: recalling preset 6.`);
                        this.cameras[this.selectedCamera - 1].recallPreset(6);
                    }

                } else {
                    console.log(`Cam ${this.selectedCamera}: preset 6 queued.`);
                    this.selectedQueuePreset = 6;
                    this.selectedQueueCamera = this.selectedCamera;
                }
                break;
            case 'seven': //preset seven
                if (this.saveModifier) {
                    //save preset
                    console.log(`Cam ${this.selectedCamera}: saving to preset 7.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101043F0107FF');
                    break;
                }
                if (!this.queue) {
                    if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                        console.log(`Cam ${this.selectedCamera}: recalling preset 7.`);
                        this.cameras[this.selectedCamera - 1].recallPreset(7);
                    }

                } else {
                    console.log(`Cam ${this.selectedCamera}: preset 7 queued.`);
                    this.selectedQueuePreset = 7;
                    this.selectedQueueCamera = this.selectedCamera;
                }
                break;
            case 'eight': //preset eight
                if (this.saveModifier) {
                    //save preset
                    console.log(`Cam ${this.selectedCamera}: saving to preset 8.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101043F0108FF');
                    break;
                }
                if (!this.queue) {
                    if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                        console.log(`Cam ${this.selectedCamera}: recalling preset 8.`);
                        this.cameras[this.selectedCamera - 1].recallPreset(8);
                    }
                } else {
                    console.log(`Cam ${this.selectedCamera}: preset 8 queued.`);
                    this.selectedQueuePreset = 8;
                    this.selectedQueueCamera = this.selectedCamera;
                }
                break;
            case 'nine': //preset nine
                if (this.saveModifier) {
                    //save preset
                    console.log(`Cam ${this.selectedCamera}: saving to preset 9.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101043F0109FF');
                    break;
                }
                if (!this.queue) {
                    if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                        console.log(`Cam ${this.selectedCamera}: recalling preset 9.`);
                        this.cameras[this.selectedCamera - 1].recallPreset(9);
                    }

                } else {
                    console.log(`Cam ${this.selectedCamera}: preset 9 queued.`);
                    this.selectedQueuePreset = 9;
                    this.selectedQueueCamera = this.selectedCamera;
                }
                break;
            case 'tab': //modifier key
                console.log('Modifier key pressed.')
                this.modifier = true;
                break;
            case 'pgUp': //zoom in
                if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                    console.log(`Cam ${this.selectedCamera}: zoom in.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101040720FF');
                }
                break;
            case 'pgDown': //zoom out
                if (this.selectedCamera != this.atem[0].state.video.mixEffects[0].programInput) {
                    console.log(`Cam ${this.selectedCamera}: zoom out.`);
                    this.cameras[this.selectedCamera - 1].sendViscaCommand('8101040730FF');
                }
                break;
            case 'zero':
                //save modifier
                this.saveModifier = true;
                console.log('Save modifier pressed.');
                break;
            case 'equals':
                this.selectLink = !this.selectLink;
                console.log(`Link: ${this.selectLink}`);
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