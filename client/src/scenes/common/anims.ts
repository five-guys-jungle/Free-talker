export interface frameInfo{
    down: { start: number, end: number },
    left: { start: number, end: number },
    right: { start: number, end: number },
    up: { start: number, end: number }
}


// export function createAnimation(scene: Phaser.Scene, characterImageKey: string,
//     frameInfo: {
//         down: { start: number, end: number },
//         left: { start: number, end: number },
//         right: { start: number, end: number },
//         up: { start: number, end: number }
//     }) {
//     scene.anims.create({
//         key: 'down',
//         frames: scene.anims.generateFrameNumbers(characterImageKey, { start: frameInfo.down.start, end: frameInfo.down.end }),
//         frameRate: 10,
//         repeat: -1
//     });

//     scene.anims.create({
//         key: 'left',
//         frames: scene.anims.generateFrameNumbers(characterImageKey, { start: frameInfo.left.start, end: frameInfo.left.end }),
//         frameRate: 10,
//         repeat: -1
//     });

//     scene.anims.create({
//         key: 'right',
//         frames: scene.anims.generateFrameNumbers(characterImageKey, { start: frameInfo.right.start, end: frameInfo.right.end }),
//         frameRate: 10,
//         repeat: -1
//     });

//     scene.anims.create({
//         key: 'up',
//         frames: scene.anims.generateFrameNumbers(characterImageKey, { start: frameInfo.up.start, end: frameInfo.up.end }),
//         frameRate: 10,
//         repeat: -1
//     });
// }