import { createSocket } from 'dgram';
import { EventEmitter } from 'events';

//generic visca ip class

class ViscaController extends EventEmitter {
    constructor(ipAddress, port) {
        super();
        this.ipAddress = ipAddress;
        this.port = port;
        this.socket = createSocket('udp4');
        this.socket.bind(() => {
            console.log('UDP socket is listening');
        });

        // Event listener for receiving responses
        this.socket.on('message', (msg, rinfo) => {
            const hexResponse = msg.toString('hex'); // Convert binary response to hexadecimal string
            this.emit('response', hexResponse, rinfo);
        });
    }

    sendViscaCommand(command) {
        const buffer = Buffer.from(command, 'hex');
        this.socket.send(buffer, 0, buffer.length, this.port, this.ipAddress, (err) => {
            if (err) {
                console.error('Error sending Visca command:', err);
                this.emit('error', err);
            } else {
                this.emit('commandSent', command);
            }
        });
    }

    // Function to recall a specific preset
    //81 01 04 3F 02 pp FF
    recallPreset(presetNumber) {
        const presetHex = presetNumber.toString(16).padStart(2, '0'); // Convert preset number to hexadecimal string
        const viscaCommand = `8101043F02${presetHex}FF`; // Visca command to recall preset
        this.sendViscaCommand(viscaCommand);
    }

    closeSocket() {
        this.socket.close();
    }
}

export default ViscaController;