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
};
