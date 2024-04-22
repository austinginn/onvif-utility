import { Atem } from 'atem-connection';

const stateChangedHandler = (state) => {
    console.log('Switcher state changed:');
    console.log(atem.state.video.mixEffects[0].programInput);
}


const atem = new Atem();
atem.connect("192.168.40.2");
// atem.on('connected', connectedHandler);
atem.on('stateChanged', stateChangedHandler);

