export const sanctuaryConfig = {
    cameras: [
        {
            name: "Left Cam",
            ip: "192.168.42.2",
            protocol: "panasonic"
        },
        {
            name: "Right Cam",
            ip: "192.168.42.3",
            protocol: "panasonic"
        }
    ],
    switchers: [
        {
            name: "Sanc 2ME",
            ip: "192.168.40.2",
            protocol: "atem"
        }
    ],
    TILT_SPEED: 25,
    PAN_SPEED: 25
}