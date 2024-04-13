export default class vbProfile {
    constructor() {
        this.selectedCamera = 1; //current selected camera
        this.queue = false; //queue next camera
        this.selectedPreset = 1; //current selected preset
        this.selectedQueueCamera = 1; //camera to run in queue
        this.selectedQueuePreset = 1; //preset to run in queue
        this.modifier = false; //modifier key status
        this.saveModifier = false; //save modifier key status
    }

    handleKeypress(atem, cameras, key) {
        switch (key) {
            case 'home': // send cameras to home position
                if (modifier) {
                    for (let i = 0; i < cameras.length; i++) {
                        console.log(`Cam ${i + 1}: go home.`);
                        cameras[i].sendViscaCommand('81010604FF');
                    }
                } else {
                    console.log(`Cam ${selectedCamera}: go home.`);
                    cameras[selectedCamera - 1].sendViscaCommand('81010604FF');
                }
                break;
            case 'upArrow': // tilt camera up
                console.log(`Cam ${selectedCamera}: tilt up.`);
                cameraConfig[selectedCamera - 1].sendViscaCommand('8101060101010301FF');
                break;
            case 'downArrow': // tilt camera down
                console.log(`Cam ${selectedCamera}: tilt down.`);
                cameras[selectedCamera - 1].sendViscaCommand('8101060101010302FF');
                break;
            case 'leftArrow': // pan camera left
                console.log(`Cam ${selectedCamera}: pan left.`);
                cameras[selectedCamera - 1].sendViscaCommand('8101060101010103FF');
                break;
            case 'rightArrow': // pan camera right
                console.log(`Cam ${selectedCamera}: pan right.`);
                cameras[selectedCamera - 1].sendViscaCommand('8101060101010203FF');
                break;
            case 'end': // stop camera movement
                if (modifier) {
                    for (let i = 0; i < cameras.length; i++) {
                        console.log(`Cam ${i + 1}: stopping.`);
                        cameras[i].sendViscaCommand('8101060101010303FF'); //stop pt
                        cameras[i].sendViscaCommand('8101040700FF'); //stop zoom
                    }
                } else {
                    console.log(`Cam ${selectedCamera}: stopping.`);
                    cameras[selectedCamera - 1].sendViscaCommand('8101060101010303FF'); //stop pt
                    cameras[selectedCamera - 1].sendViscaCommand('8101040700FF'); //stop zoom
                }
                break;
            case 'period': //toggle queue mode
                queue = !queue;
                console.log(`Queue mode: ${queue}`);
                break;
            case 'enter': //run queue
                console.log(`Cam ${selectedQueueCamera}: running queue.`);
                cameras[selectedQueueCamera - 1].recallPreset(selectedQueuePreset);
                break;
            case 'numLock': //select cam 1
                selected = 1;
                atem.setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 18 }, 0);
                console.log(`Cam ${selectedCamera}: selected.`);
                break;
            case 'divide': //select cam 2
                selected = 2;
                atem.setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 19 }, 0);
                console.log(`Cam ${selectedCamera}: selected.`);
                break;
            case 'multiply': //select cam 3
                selected = 3;
                atem.setMediaPlayerSource({ clipIndex: 1, sourceType: 1, stillIndex: 20 }, 0);
                console.log(`Cam ${selectedCamera}: selected.`);
                break;
            case 'one': //preset one
                if (saveModifier) {
                    //save preset
                    console.log(`Cam ${selectedCamera}: saving to preset 1.`);
                    cameras[selectedCamera - 1].sendViscaCommand('8101043F0101FF');
                    break;
                }
                if (!queue) {
                    console.log(`Cam ${selectedCamera}: recalling preset 1.`);
                    cameras[selectedCameras - 1].recallPreset(1);
                } else {
                    console.log(`Cam ${selectedCamera}: preset 1 queued.`);
                    selectedQueuePreset = 1;
                    selectedQueueCamera = selectedCamera;
                }
                break;
            case 'two': //preset two
                if (saveModifier) {
                    //save preset
                    console.log(`Cam ${selectedCamera}: saving to preset 2.`);
                    cameras[selectedCamera - 1].sendViscaCommand('8101043F0102FF');
                    break;
                }
                if (!queue) {
                    console.log(`Cam ${selectedCamera}: recalling preset 2.`);
                    cameras[selectedCamera - 1].recallPreset(2);
                } else {
                    console.log(`Cam ${selectedCamera}: preset 2 queued.`);
                    selectedQueuePreset = 2;
                    selectedQueueCamera = selectedCamera;
                }
                break;
            case 'three': //preset three
                if (saveModifier) {
                    //save preset
                    console.log(`Cam ${selectedCamera}: saving to preset 3.`);
                    cameras[selectedCamera - 1].sendViscaCommand('8101043F0103FF');
                    break;
                }
                if (!queue) {
                    console.log(`Cam ${selectedCamera}: recalling preset 3.`);
                    cameras[selectedCamera - 1].recallPreset(3);
                } else {
                    console.log(`Cam ${selectedCamera}: preset 3 queued.`);
                    selectedQueuePreset = 3;
                    selectedQueueCamera = selectedCamera;
                }
                break;
            case 'four': //preset four
                if (saveModifier) {
                    //save preset
                    console.log(`Cam ${selectedCamera}: saving to preset 4.`);
                    cameras[selectedCamera - 1].sendViscaCommand('8101043F0104FF');
                    break;
                }
                if (!queue) {
                    console.log(`Cam ${selectedCamera}: recalling preset 4.`);
                    cameras[selectedCamera - 1].recallPreset(4);
                } else {
                    console.log(`Cam ${selectedCamera}: preset 4 queued.`);
                    selectedQueuePreset = 4;
                    selectedQueueCamera = selectedCamera;
                }
                break;
            case 'five': //preset five
                if (saveModifier) {
                    //save preset
                    console.log(`Cam ${selectedCamera}: saving to preset 5.`);
                    cameras[selectedCamera - 1].sendViscaCommand('8101043F0105FF');
                    break;
                }
                if (!queue) {
                    console.log(`Cam ${selectedCamera}: recalling preset 5.`);
                    cameras[selectedCamera - 1].recallPreset(5);
                } else {
                    console.log(`Cam ${selectedCamera}: preset 5 queued.`);
                    selectedQueuePreset = 5;
                    selectedQueueCamera = selectedCamera;
                }
                break;
            case 'six': //preset six
                if (saveModifier) {
                    //save preset
                    console.log(`Cam ${selectedCamera}: saving to preset 6.`);
                    cameras[selectedCamera - 1].sendViscaCommand('8101043F0106FF');
                    break;
                }
                if (!queue) {
                    console.log(`Cam ${selectedCamera}: recalling preset 6.`);
                    cameras[selectedCamera - 1].recallPreset(6);
                } else {
                    console.log(`Cam ${selectedCamera}: preset 6 queued.`);
                    selectedQueuePreset = 6;
                    selectedQueueCamera = selectedCamera;
                }
                break;
            case 'seven': //preset seven
                if (saveModifier) {
                    //save preset
                    console.log(`Cam ${selectedCamera}: saving to preset 7.`);
                    cameras[selectedCamera - 1].sendViscaCommand('8101043F0107FF');
                    break;
                }
                if (!queue) {
                    console.log(`Cam ${selectedCamera}: recalling preset 7.`);
                    cameras[selectedCamera - 1].recallPreset(7);
                } else {
                    console.log(`Cam ${selectedCamera}: preset 7 queued.`);
                    selectedQueuePreset = 7;
                    selectedQueueCamera = selectedCamera;
                }
                break;
            case 'eight': //preset eight
                if (saveModifier) {
                    //save preset
                    console.log(`Cam ${selectedCamera}: saving to preset 8.`);
                    cameras[selectedCamera - 1].sendViscaCommand('8101043F0108FF');
                    break;
                }
                if (!queue) {
                    console.log(`Cam ${selectedCamera}: recalling preset 8.`);
                    cameras[selectedCamera - 1].recallPreset(8);
                } else {
                    console.log(`Cam ${selectedCamera}: preset 8 queued.`);
                    selectedQueuePreset = 8;
                    selectedQueueCamera = selectedCamera;
                }
                break;
            case 'nine': //preset nine
                if (saveModifier) {
                    //save preset
                    console.log(`Cam ${selectedCamera}: saving to preset 9.`);
                    cameras[selectedCamera - 1].sendViscaCommand('8101043F0109FF');
                    break;
                }
                if (!queue) {
                    console.log(`Cam ${selectedCamera}: recalling preset 9.`);
                    cameras[selectedCamera - 1].recallPreset(9);
                } else {
                    console.log(`Cam ${selectedCamera}: preset 9 queued.`);
                    selectedQueuePreset = 9;
                    selectedQueueCamera = selectedCamera;
                }
                break;
            case 'tab': //modifier key
                console.log('Modifier key pressed.')
                modifier = true;
                break;
            case 'pgUp': //zoom in
                console.log(`Cam ${selectedCamera}: zoom in.`);
                cameras[selectedCamera - 1].sendViscaCommand('8101040720FF');
                break;
            case 'pgDn': //zoom out
                console.log(`Cam ${selectedCamera}: zoom out.`);
                cameras[selectedCamera - 1].sendViscaCommand('8101040730FF');
                break;
            case 'zero':
                //save modifier
                save = true;
                console.log('Save modifier pressed.');
                break;
            default:
                break;
        }
    }

    handleKeyrelease(atem, cameras, key) {
        switch (key) {
            case 'tab': //modifier key
                console.log('Modifier key released.')
                modifier = false;
                break;
            case 'zero':
                //save modifier
                saveModifier = false;
                console.log('Save modifier released.');
                break;
            default:
                break;
        }
    }
}