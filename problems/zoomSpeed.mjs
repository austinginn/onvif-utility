//Zoom speed limitations of Alfatron 1080p PTZ cameras via ONVI
//by Austin Ginn

import OnvifManager from 'onvif-nvt';

OnvifManager.connect('192.168.5.163', 2000, 'admin', 'admin')
  .then(results => {
    let camera = results

    if (camera.ptz) { // PTZ is supported on this device
      let vector = { x: 0, y: 0, z: .01 } 
      camera.ptz.continuousMove(null, vector)
        .then(() => {
          setTimeout(() => {
            camera.ptz.stop()
          }, 10000) // stop the camera after 10 seconds
        });
    }
  })