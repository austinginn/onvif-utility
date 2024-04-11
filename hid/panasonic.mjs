import { EventEmitter } from 'events';

class PanasonicController extends EventEmitter {
    constructor(ipAddress) {
        super();
        this.url = `http://${ipAddress}/cgi-bin/aw_ptz?cmd=`
    }

    // Function to recall a specific preset
    //81 01 04 3F 02 pp FF
    async recallPresest(presetNumber) {
        const res = await fetch(`${this.url}%23R${presetNumber}&res=1`);
        //check status

        //return result
    }

    async panLeft(speed) {
        //convert speed
        let pSpeed = math.max(1, Math.min(100, speed));
        pSpeed = Math.ceil((100 - pSpeed) / (100 / 48)) + 1;
        pSpeed = speed.toString().padStart(2, '0');

        const res = await fetch(`${this.url}%23P${pSpeed}&res=1`);
        //check status

        //return result
    }

    async panRight(speed) {
        let pSpeed = Math.max(1, Math.min(100, speed));
        pSpeed = Math.ceil(pSpeed * (99 - 51) / 100) + 51;

        const res = await fetch(`${this.url}%23P${pSpeed}&res=1`);
    }

    async tiltDown(speed) {
        //convert speed
        let pSpeed = math.max(1, Math.min(100, speed));
        pSpeed = Math.ceil((100 - pSpeed) / (100 / 48)) + 1;
        pSpeed = speed.toString().padStart(2, '0');

        const res = await fetch(`${this.url}%23T${pSpeed}&res=1`);
    }

    async tiltUp(speed) {
        let pSpeed = Math.max(1, Math.min(100, speed));
        pSpeed = Math.ceil(pSpeed * (99 - 51) / 100) + 51;

        const res = await fetch(`${this.url}%23T${pSpeed}&res=1`);
    }

    async stop() {
        const res = await fetch(`${this.url}%23PTS5050&res=1`);
    }
}

export default PanasonicController;