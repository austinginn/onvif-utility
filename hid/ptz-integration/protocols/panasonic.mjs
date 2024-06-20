import { EventEmitter } from 'events';
//see https://eww.pass.panasonic.co.jp/pro-av/support/content/guide/DEF/HE50_120_IP/HDIntegratedCamera_InterfaceSpecifications-E.pdf

class PanasonicController extends EventEmitter {
    constructor(ipAddress) {
        super();
        this.url = `http://${ipAddress}/cgi-bin/aw_ptz?cmd=`
    }

    //for commands not included in class
    async sendCommand(cmd){
        const res = await fetch(`${this.url}${cmd}&res=1`)
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
        return true;
    }

    // Function to recall a specific preset
    async recallPreset(presetNumber) {
        // Ensure presetNumber is always two digits
        presetNumber = presetNumber - 1;
        const paddedPresetNumber = String(presetNumber).padStart(2, '0');
        console.log(paddedPresetNumber);
        console.log(`${this.url}%23R${paddedPresetNumber}&res=1`)
        const res = await fetch(`${this.url}%23R${paddedPresetNumber}&res=1`);
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
        return true;
    }

    async savePreset(presetNumber) {
        // Ensure presetNumber is always two digits
        const paddedPresetNumber = String(presetNumber -1).padStart(2, '0');
        const res = await fetch(`${this.url}%23M${paddedPresetNumber}&res=1`)
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
        return true;
    }

    async panLeft(speed) {
        //convert speed
        let pSpeed = Math.max(1, Math.min(100, speed));
        pSpeed = Math.ceil((100 - pSpeed) / (100 / 48)) + 1;
        pSpeed = pSpeed.toString().padStart(2, '0');

        console.log(pSpeed);

        const res = await fetch(`${this.url}%23P${pSpeed}&res=1`);
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
        return true;
    }

    async panRight(speed) {
        let pSpeed = Math.max(1, Math.min(100, speed));
        pSpeed = Math.ceil(pSpeed * (99 - 51) / 100) + 51;
        console.log("right", pSpeed);
        pSpeed = pSpeed.toString().padStart(2, '0');
        console.log(pSpeed);

        const res = await fetch(`${this.url}%23P${pSpeed}&res=1`);
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
        return true;
    }

    async tiltDown(speed) {
        //convert speed
        let pSpeed = Math.max(1, Math.min(100, speed));
        pSpeed = Math.ceil((100 - pSpeed) / (100 / 48)) + 1;
        pSpeed = pSpeed.toString().padStart(2, '0');

        console.log(pSpeed);

        const res = await fetch(`${this.url}%23T${pSpeed}&res=1`);
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
        return true;
    }

    async tiltUp(speed) {
        let pSpeed = Math.max(1, Math.min(100, speed));
        pSpeed = Math.ceil(pSpeed * (99 - 51) / 100) + 51;
        pSpeed = pSpeed.toString().padStart(2, '0');

        console.log(pSpeed);

        const res = await fetch(`${this.url}%23T${pSpeed}&res=1`);
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
        return true;
    }

    async stopPT() {
        const res = await fetch(`${this.url}%23PTS5050&res=1`);
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
        return true;
    }

    async stopZ() {
        const res = await fetch(`${this.url}%23Z50&res=1`);
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
    }

    async zoomIn(speed) {
        let pSpeed = Math.max(1, Math.min(100, speed));
        pSpeed = Math.ceil(pSpeed * (99 - 51) / 100) + 51;
        pSpeed = pSpeed.toString().padStart(2, '0');

        console.log(pSpeed);

        const res = await fetch(`${this.url}%23Z${pSpeed}&res=1`);
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
        return true;
    }

    async zoomOut(speed){
        let pSpeed = Math.max(1, Math.min(100, speed));
        pSpeed = Math.ceil((100 - pSpeed) / (100 / 48)) + 1;
        pSpeed = pSpeed.toString().padStart(2, '0');

        console.log(pSpeed);

        const res = await fetch(`${this.url}%23Z${pSpeed}&res=1`);
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
        return true;
    }

    async home(){
        const res = await fetch(`${this.url}%23APC80008000&res=1`);
        if(!res.ok){
            console.error(`HTTP error! status: ${res.status}`);
            return false;
        }
        return true;
    }
}

export default PanasonicController;