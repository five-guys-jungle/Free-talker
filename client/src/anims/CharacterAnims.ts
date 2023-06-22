import Phaser from "phaser";

export const createCharacterAnims = (
    anims: Phaser.Animations.AnimationManager
) => {
    const animsFrameRate = 15;

    anims.create({
        key: "nancy_idle_right",
        frames: anims.generateFrameNumbers("nancy", {
            start: 0,
            end: 5,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "nancy_idle_up",
        frames: anims.generateFrameNumbers("nancy", {
            start: 6,
            end: 11,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "nancy_idle_left",
        frames: anims.generateFrameNumbers("nancy", {
            start: 12,
            end: 17,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "nancy_idle_down",
        frames: anims.generateFrameNumbers("nancy", {
            start: 18,
            end: 23,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "nancy_run_right",
        frames: anims.generateFrameNumbers("nancy", {
            start: 24,
            end: 29,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "nancy_run_up",
        frames: anims.generateFrameNumbers("nancy", {
            start: 30,
            end: 35,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "nancy_run_left",
        frames: anims.generateFrameNumbers("nancy", {
            start: 36,
            end: 41,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "nancy_run_down",
        frames: anims.generateFrameNumbers("nancy", {
            start: 42,
            end: 47,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "lucy_idle_right",
        frames: anims.generateFrameNumbers("lucy", {
            start: 0,
            end: 5,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "lucy_idle_up",
        frames: anims.generateFrameNumbers("lucy", {
            start: 6,
            end: 11,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "lucy_idle_left",
        frames: anims.generateFrameNumbers("lucy", {
            start: 12,
            end: 17,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "lucy_idle_down",
        frames: anims.generateFrameNumbers("lucy", {
            start: 18,
            end: 23,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "lucy_run_right",
        frames: anims.generateFrameNumbers("lucy", {
            start: 24,
            end: 29,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "lucy_run_up",
        frames: anims.generateFrameNumbers("lucy", {
            start: 30,
            end: 35,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "lucy_run_left",
        frames: anims.generateFrameNumbers("lucy", {
            start: 36,
            end: 41,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "lucy_run_down",
        frames: anims.generateFrameNumbers("lucy", {
            start: 42,
            end: 47,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "ash_idle_right",
        frames: anims.generateFrameNumbers("ash", {
            start: 0,
            end: 5,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "ash_idle_up",
        frames: anims.generateFrameNumbers("ash", {
            start: 6,
            end: 11,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "ash_idle_left",
        frames: anims.generateFrameNumbers("ash", {
            start: 12,
            end: 17,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "ash_idle_down",
        frames: anims.generateFrameNumbers("ash", {
            start: 18,
            end: 23,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "ash_run_right",
        frames: anims.generateFrameNumbers("ash", {
            start: 24,
            end: 29,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "ash_run_up",
        frames: anims.generateFrameNumbers("ash", {
            start: 30,
            end: 35,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "ash_run_left",
        frames: anims.generateFrameNumbers("ash", {
            start: 36,
            end: 41,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "ash_run_down",
        frames: anims.generateFrameNumbers("ash", {
            start: 42,
            end: 47,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "adam_idle_right",
        frames: anims.generateFrameNumbers("adam", {
            start: 0,
            end: 5,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "adam_idle_up",
        frames: anims.generateFrameNumbers("adam", {
            start: 6,
            end: 11,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "adam_idle_left",
        frames: anims.generateFrameNumbers("adam", {
            start: 12,
            end: 17,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "adam_idle_down",
        frames: anims.generateFrameNumbers("adam", {
            start: 18,
            end: 23,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "adam_run_right",
        frames: anims.generateFrameNumbers("adam", {
            start: 24,
            end: 29,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });
    anims.create({
        key: "adam_run_right_up",
        frames: anims.generateFrameNumbers("adam", {
            start: 24,
            end: 29,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });
    anims.create({
        key: "adam_run_right_down",
        frames: anims.generateFrameNumbers("adam", {
            start: 24,
            end: 29,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "adam_run_up",
        frames: anims.generateFrameNumbers("adam", {
            start: 30,
            end: 35,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "adam_run_left",
        frames: anims.generateFrameNumbers("adam", {
            start: 36,
            end: 41,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });
    anims.create({
        key: "adam_run_left_down",
        frames: anims.generateFrameNumbers("adam", {
            start: 36,
            end: 41,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });
    anims.create({
        key: "adam_run_left_up",
        frames: anims.generateFrameNumbers("adam", {
            start: 36,
            end: 41,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "adam_run_down",
        frames: anims.generateFrameNumbers("adam", {
            start: 42,
            end: 47,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhoman_idle_right",
        frames: anims.generateFrameNames("jinhoman", {
            start: 0,
            end: 5,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "jinhoman_idle_up",
        frames: anims.generateFrameNames("jinhoman", {
            start: 6,
            end: 11,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "jinhoman_idle_left",
        frames: anims.generateFrameNames("jinhoman", {
            start: 12,
            end: 17,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "jinhoman_idle_down",
        frames: anims.generateFrameNames("jinhoman", {
            start: 18,
            end: 23,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "jinhoman_run_right",
        frames: anims.generateFrameNames("jinhoman", {
            start: 24,
            end: 29,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhoman_run_up",
        frames: anims.generateFrameNames("jinhoman", {
            start: 30,
            end: 35,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhoman_run_left",
        frames: anims.generateFrameNames("jinhoman", {
            start: 36,
            end: 41,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhoman_run_down",
        frames: anims.generateFrameNames("jinhoman", {
            start: 42,
            end: 47,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhoman_sit_down",
        frames: anims.generateFrameNames("jinhoman", {
            start: 48,
            end: 48,
        }),
        repeat: 0,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhoman_sit_left",
        frames: anims.generateFrameNames("jinhoman", {
            start: 49,
            end: 49,
        }),
        repeat: 0,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhoman_sit_right",
        frames: anims.generateFrameNames("jinhoman", {
            start: 50,
            end: 50,
        }),
        repeat: 0,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhoman_sit_up",
        frames: anims.generateFrameNames("jinhoman", {
            start: 51,
            end: 51,
        }),
        repeat: 0,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhogirl_idle_right",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 0,
            end: 5,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "jinhogirl_idle_up",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 6,
            end: 11,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "jinhogirl_idle_left",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 12,
            end: 17,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "jinhogirl_idle_down",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 18,
            end: 23,
        }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
    });

    anims.create({
        key: "jinhogirl_run_right",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 24,
            end: 29,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhogirl_run_up",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 30,
            end: 35,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhogirl_run_left",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 36,
            end: 41,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhogirl_run_down",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 42,
            end: 47,
        }),
        repeat: -1,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhogirl_sit_down",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 48,
            end: 48,
        }),
        repeat: 0,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhogirl_sit_left",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 49,
            end: 49,
        }),
        repeat: 0,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhogirl_sit_right",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 50,
            end: 50,
        }),
        repeat: 0,
        frameRate: animsFrameRate,
    });

    anims.create({
        key: "jinhogirl_sit_up",
        frames: anims.generateFrameNames("jinhogirl", {
            start: 51,
            end: 51,
        }),
        repeat: 0,
        frameRate: animsFrameRate,
    });
};
