import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import AirPortScene from '../scenes/airPort';

export default function Game() {
    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: "phaser-game", // 게임을 렌더링할 DOM 요소를 지정합니다.
            physics: {
                default: "arcade",
                arcade: {
                    gravity: { y: 0 },
                },
            },
            scene: [AirPortScene],
        };

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };
    }, []);

    return <div id="phaser-game" />;
}