import PanasonicController from './panasonic.mjs'

const camera = new PanasonicController('192.168.42.3');
camera.recallPresest('01');