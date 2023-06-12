export function createAnimation(scene:Phaser.Scene, characterImageKey: string) {
    scene.anims.create({
        key: 'down',
        frames: scene.anims.generateFrameNumbers(characterImageKey, { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'left',
        frames: scene.anims.generateFrameNumbers(characterImageKey, { start: 3, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'right',
        frames: scene.anims.generateFrameNumbers(characterImageKey, { start: 6, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'up',
        frames: scene.anims.generateFrameNumbers(characterImageKey, { start: 9, end: 11 }),
        frameRate: 10,
        repeat: -1
    });
}