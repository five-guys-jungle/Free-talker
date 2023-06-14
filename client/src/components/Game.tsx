import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import AirPortScene from "../scenes/airPort";
import { useRecoilValue } from "recoil";
import {
    playerIdState,
    playerNicknameState,
    playerTextureState,
} from "../recoil/user/atoms";

export default function Game() {
    const playerId = useRecoilValue(playerIdState);
    const playerNickname = useRecoilValue(playerNicknameState);
    const playerTexture = useRecoilValue(playerTextureState);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 1440,
            height: 960,
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
        game.scene.start("AirPortScene", {
            playerId: playerId,
            playerNickname: playerNickname,
            playerTexture: playerTexture,
        });

        return () => {
            game.destroy(true);
        };
    }, []);

    return <div id="phaser-game" />;
}
