import React, { useEffect } from 'react';
import Phaser from 'phaser';
import airPortScene from '../scenes/airPort';

export default function Game() {
    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            physics: {
                default: "arcade",
                arcade: {
                    gravity: { y: 0 },
                },
            },
            scene: [airPortScene],
        };

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };
    }, []);

    return <div id="phaser-game" />;
}