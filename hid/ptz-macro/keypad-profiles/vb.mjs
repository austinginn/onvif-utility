export default class vb {
    constructor() {
        this.selectedCamera = 1; //current selected camera
        this.queue = false; //queue next camera
        this.selectedPreset = 1;
        this.selectedQueueCamera = 1;
        this.selectedQueuePreset = 1;
        this.modifier = false;
        this.saveModifier = false;
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
                
        }
    }

    handleKeyrelease(atem, cameras, key) {
    }


}