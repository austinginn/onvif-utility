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
        this.ZOOM_SPEED = sanctuaryConfig.ZOOM_SPEED;
        this.PAN_WAIT = 2000;
        this.selectLink = false;
        this.macros = false;
    }

    async connectToDevices() {
        this.cameras = this.#initPanasonic(this.cameraConfig);
        this.atem = await this.#initAtem(this.switcherConfig);
        // this.atem[0].on('stateChanged', (state, pathToChange) => {
        //     console.log('stateChanged', state, pathToChange);
        // });
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
            console.log("Camera is live");
            return true;

        }
        console.log("Camera is not live");
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
                    if (!this.#isLive(this.selectedCamera)) {
                        //send home
                        this.cameras[this.selectedCamera - 1].home();
                    }
                }
                break;
            case 'equals':
                this.selectLink = !this.selectLink;
                console.log(`Link: ${this.selectLink}`);
                break;
            case 'upArrow': // tilt camera up
                if (!this.#isLive(this.selectedCamera)) {
                    console.log(`Cam ${this.selectedCamera}: tilt up.`);
                    this.cameras[this.selectedCamera - 1].tiltUp(this.TILT_SPEED);
                }
                break;
            case 'downArrow': // tilt camera down
                if (!this.#isLive(this.selectedCamera)) {
                    console.log(`Cam ${this.selectedCamera}: tilt down.`);
                    this.cameras[this.selectedCamera - 1].tiltDown(this.TILT_SPEED);
                }
                break;
            case 'leftArrow': // pan camera left
                if (!this.#isLive(this.selectedCamera)) {
                    console.log(`Cam ${this.selectedCamera}: pan left.`);
                    this.cameras[this.selectedCamera - 1].panLeft(this.PAN_SPEED);
                }
                break;
            case 'rightArrow': // pan camera right
                if (!this.#isLive(this.selectedCamera)) {
                    console.log(`Cam ${this.selectedCamera}: pan right.`);
                    this.cameras[this.selectedCamera - 1].panRight(this.PAN_SPEED);
                }
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
                    this.cameras[this.selectedCamera - 1].stopZ(); //stop zoom
                    // this.cameras[this.selectedCamera - 1]. //stop zoom
                }
                break;
            // case 'period': //turn on
            //     this.queue = true;
            //     console.log(`Queue mode: ${this.queue}`);
            //     break;
            case 'enter': //cut me1
                console.log("cut");
                this.atem[0].cut(0);
                break;
            case 'subtract': // dissolve into propresenter
                console.log("disolve into propresenter");
                this.atem[0].changePreviewInput(1, 0);
                setTimeout(() => {
                    this.atem[0].autoTransition(0);
                }, 200);
                break;
            case 'add': // dissolve
                if (this.modifier) {
                    //dissolve me2
                    console.log("ME2 AUTO");
                    this.atem[0].autoTransition(1);
                    break;
                }
                console.log("dissolve");
                this.atem[0].autoTransition(0);
                break;
            case 'openParen': //preview mid cam
                console.log(`Cam Left: preview.`);
                this.atem[0].changePreviewInput(3, 0);
                break;
            case 'closeParen': //preview Left cam
                console.log(`Cam Mid: preview.`);
                this.atem[0].changePreviewInput(4, 0);
                break;
            case 'calc': //preview right cam
                console.log(`Cam Right: preview.`);
                this.atem[0].changePreviewInput(5, 0);
                break;
            case 'backspace': //preview Floor
                console.log(`Cam Floor: preview.`);
                this.atem[0].changePreviewInput(6, 0);
                break;
            case 'numLock': //select cam 1
                this.selectedCamera = 1;
                if (this.selectLink) {
                    this.atem[0].changePreviewInput(3, 0);
                }
                // this.atem[0].setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 18 }, 0);
                console.log(`Cam ${this.selectedCamera}: selected.`);
                break;
            case 'divide': //select cam 2
                this.selectedCamera = 2;
                if (this.selectLink) {
                    this.atem[0].changePreviewInput(5, 0);
                }
                // this.atem[0].setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 19 }, 0);
                console.log(`Cam ${this.selectedCamera}: selected.`);
                break;
            case 'multiply': //select cam 3
                // this.selectedCamera = 3;
                if (this.selectLink) {
                    this.atem[0].changePreviewInput(3, 0);
                }
                // // this.atem[0].setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 20 }, 0);
                // console.log(`Cam ${this.selectedCamera}: selected.`);
                break;
            case 'one': //preset one
                if (this.macros) {
                    console.log('Recalling Macro 1');
                    //check whats on program and set preview to program
                    const program = this.atem[0].state.video.mixEffects[0].programInput;
                    this.atem[0].changePreviewInput(program, 0);
                    this.atem[0].macroRun(0);
                    break;
                }
                this.#handlePreset(1);
                break;
            case 'two': //preset two
                if (this.macros) {
                    console.log('Recalling Macro 2');
                    //check whats on program and set preview to program
                    const program = this.atem[0].state.video.mixEffects[0].programInput;
                    this.atem[0].changePreviewInput(program, 0);
                    this.atem[0].macroRun(1);
                    break;
                }
                this.#handlePreset(2);
                break;
            case 'three': //preset three
                if (this.macros) {
                    console.log('Recalling Macro 3');
                    //check whats on program and set preview to program
                    const program = this.atem[0].state.video.mixEffects[0].programInput;
                    this.atem[0].changePreviewInput(program, 0);
                    this.atem[0].macroRun(2);
                    break;
                }
                this.#handlePreset(3);
                break;
            case 'four': //preset four
                if (this.macros) {
                    console.log('Recalling Macro 4');
                    //check whats on program and set preview to program
                    const program = this.atem[0].state.video.mixEffects[0].programInput;
                    this.atem[0].changePreviewInput(program, 0);
                    this.atem[0].macroRun(3);
                    break;
                }
                this.#handlePreset(4);
                break;
            case 'five': //preset five
                if (this.macros) {
                    console.log('Recalling Macro 5');
                    //check whats on program and set preview to program
                    const program = this.atem[0].state.video.mixEffects[0].programInput;
                    this.atem[0].changePreviewInput(program, 0);
                    this.atem[0].macroRun(4);
                    break;
                }
                this.#handlePreset(5);
                break;
            case 'six': //preset six
                if (this.macros) {
                    console.log('Recalling Macro 6');
                    //check whats on program and set preview to program
                    const program = this.atem[0].state.video.mixEffects[0].programInput;
                    this.atem[0].changePreviewInput(program, 0);
                    this.atem[0].macroRun(5);
                    break;
                }
                this.#handlePreset(6);
                break;
            case 'seven': //preset seven
                if (this.macros) {
                    console.log('Recalling Macro 7');
                    //check whats on program and set preview to program
                    const program = this.atem[0].state.video.mixEffects[0].programInput;
                    this.atem[0].changePreviewInput(program, 0);
                    this.atem[0].macroRun(6);
                    break;
                }
                this.#handlePreset(7);
                break;
            case 'eight': //preset eight' auto choir pans
                if (this.macros) {
                    console.log('Recalling Macro 8');
                    //check whats on program and set preview to program
                    const program = this.atem[0].state.video.mixEffects[0].programInput;
                    this.atem[0].changePreviewInput(program, 0);
                    this.atem[0].macroRun(7);
                    break;
                }
                this.#handlePreset(8);

                //if modifier key is pressed start right pan
                if (!this.#isLive(this.selectedCamera)) {
                    if (this.modifier) {
                        setTimeout(() => {
                            console.log(`Cam ${this.selectedCamera}: pan right.`);
                            this.cameras[this.selectedCamera - 1].panRight(this.PAN_SPEED);
                        }, this.PAN_WAIT);
                    }
                }
                break;
            case 'nine': //preset nine
                if (this.macros) {
                    console.log('Recalling Macro 9');
                    //check whats on program and set preview to program
                    const program = this.atem[0].state.video.mixEffects[0].programInput;
                    this.atem[0].changePreviewInput(program, 0);
                    this.atem[0].macroRun(8);
                    break;
                }
                this.#handlePreset(9);

                //if modifier key is pressed start left pan
                if (!this.#isLive(this.selectedCamera)) {
                    if (this.modifier) {
                        setTimeout(() => {
                            console.log(`Cam ${this.selectedCamera}: pan left.`);
                            this.cameras[this.selectedCamera - 1].panLeft(this.PAN_SPEED);
                        }, this.PAN_WAIT);
                    }
                }
                break;
            case 'tab': //modifier key
                console.log('Modifier key pressed.')
                this.modifier = true;
                break;
            case 'pgUp': //zoom in
                if (!this.#isLive(this.selectedCamera)) {
                    console.log(`Cam ${this.selectedCamera}: zoom in.`);
                    this.cameras[this.selectedCamera - 1].zoomIn(this.ZOOM_SPEED);
                }
                break;
            case 'pgDown': //zoom out
                if (!this.#isLive(this.selectedCamera)) {
                    //console.log(`Cam ${this.selectedCamera}: zoom out.`);
                    this.cameras[this.selectedCamera - 1].zoomOut(this.ZOOM_SPEED);
                }
                break;
            case 'zero':
                //save modifier
                this.saveModifier = true;
                console.log('Save modifier pressed.');
                break;

            case 'escape':
                console.log('macro mode on');
                this.macros = true;
                break;
            case 'delete':
                console.log('Reset USK');
                this.atem[0].macroRun(18);
                break;
            default:
                break;
        }
    }

    handleKeyrelease(key) {
        switch (key) {
            case 'escape':
                console.log('macro mode off');
                this.macros = false;
                break;
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