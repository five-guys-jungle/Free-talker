import React, { useEffect, useRef } from "react";
// import { useDispatch } from "react-redux";
import Phaser from "phaser";
import Airport from "./scenes/Airport"; // 위에서 작성한 Game 클래스를 가져옵니다.
// import { setGameInstance } from "./stores/gameSlice";

// const config = {
//     type: Phaser.AUTO,
//     backgroundColor: "#EEEEEE",
//     parent: "PhaserGame", // 게임을 렌더링할 DOM 요소를 지정합니다.
//     scene: [Airport],
//     width: "100wh",
//     height: "100vh",
//     physics: {
//         default: "arcade",
//     },
// };

// let phaserGame = new Phaser.Game(config);

function GameComponent() {
    const gameRef = useRef(null);

    useEffect(() => {
        if (gameRef.current) {
            const config = {
                type: Phaser.AUTO,
                backgroundColor: "#EEEEEE",
                width: "100wh",
                height: "100vh",
                physics: {
                    default: "arcade",
                },
                scene: Airport,
                parent: gameRef.current, // 게임을 렌더링할 DOM 요소를 지정합니다.
            };

            const game = new Phaser.Game(config);

            return () => {
                // 컴포넌트가 언마운트될 때 게임 인스턴스를 파괴합니다.
                game.destroy(true);
            };
        }
    }, []);

    return <div ref={gameRef} />;
}

export default GameComponent;
