import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Phaser from "phaser";
import AirPortScene from "../scenes/airPort";
import {
setPlayerId,
setPlayerNickname,
setPlayerTexture,
} from "../stores/userSlice";
import {
selectPlayerId,
selectPlayerNickname,
selectPlayerTexture,
} from "../stores/userSlice";

export default function Game() {
const dispatch = useDispatch();
const playerId = useSelector(selectPlayerId);
const playerNickname = useSelector(selectPlayerNickname);
const playerTexture = useSelector(selectPlayerTexture);
console.log(`"playerId:"${playerId}, "playerNickname:" ${playerNickname}, "playerTexture":"${playerTexture}`);
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
