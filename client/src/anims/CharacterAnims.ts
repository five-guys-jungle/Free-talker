import Phaser from "phaser";

const textureNameList: string[] = [
    "jinhoman",
    "jinhogirl",
    "seunghun",
    "doyoungboy",
    "minsook",
    "minsik"
];

export const createCharacterAnims = (
    anims: Phaser.Animations.AnimationManager
) => {
    const animsFrameRate = 15;

    for(let texturename of textureNameList){
        console.log("texturename: ", texturename);
        anims.create({
            key: `${texturename}_idle_right`,
            frames: anims.generateFrameNames(`${texturename}`, {
                start: 0,
                end: 5,
            }),
            repeat: -1,
            frameRate: animsFrameRate * 0.6,
        });
    
        anims.create({
            key: `${texturename}_idle_up`,
            frames: anims.generateFrameNames(`${texturename}`, {
                start: 6,
                end: 11,
            }),
            repeat: -1,
            frameRate: animsFrameRate * 0.6,
        });
    
        anims.create({
            key: `${texturename}_idle_left`,
            frames: anims.generateFrameNames(`${texturename}`, {
                start: 12,
                end: 17,
            }),
            repeat: -1,
            frameRate: animsFrameRate * 0.6,
        });
    
        anims.create({
            key: `${texturename}_idle_down`,
            frames: anims.generateFrameNames(`${texturename}`, {
                start: 18,
                end: 23,
            }),
            repeat: -1,
            frameRate: animsFrameRate * 0.6,
        });
    
        anims.create({
            key: `${texturename}_run_right`,
            frames: anims.generateFrameNames(`${texturename}`, {
                start: 24,
                end: 29,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
        });
    
        anims.create({
            key: `${texturename}_run_up`,
            frames: anims.generateFrameNames(`${texturename}`, {
                start: 30,
                end: 35,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
        });
    
        anims.create({
            key: `${texturename}_run_left`,
            frames: anims.generateFrameNames(`${texturename}`, {
                start: 36,
                end: 41,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
        });
    
        anims.create({
            key: `${texturename}_run_down`,
            frames: anims.generateFrameNames(`${texturename}`, {
                start: 42,
                end: 47,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
        });
    
        anims.create({
            key: `${texturename}_sit_left`,
            frames: anims.generateFrameNames(`${texturename}`, {
                start: 48,
                end: 48,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
        });
    
        anims.create({
            key: `${texturename}_sit_right`,
            frames: anims.generateFrameNames(`${texturename}`, {
                start: 49,
                end: 49,
            }),
            repeat: -1,
            frameRate: animsFrameRate,
        });
    }
    anims.create({
        key: 'gateAnim',
        frames: anims.generateFrameNumbers('gate', { start: 0, end: 5 }),
        frameRate: 7,
        repeat: 0
    });
};
