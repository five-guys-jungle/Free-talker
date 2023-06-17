import AirportScene from './scenes/airPort';
import Phaser from 'phaser';
import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';
import { GameType } from './types';


const pluginConfig = {
  // The plugin class:
  plugin: PhaserMatterCollisionPlugin,
  // Where to store in Scene.Systems, e.g. scene.sys.matterCollision:
  key: 'matterCollision' as 'matterCollision',
  // Where to store in the Scene, e.g. scene.matterCollision:
  mapping: 'matterCollision' as 'matterCollision',
};

declare module 'phaser' {
  interface Scene {
    [pluginConfig.mapping]: PhaserMatterCollisionPlugin;
  }
  namespace Scenes {
    interface Systems {
      [pluginConfig.key]: PhaserMatterCollisionPlugin;
    }
  }
}

// declare module '*.png';

const config = {
  // width: "100%", //  scene이 그려지는 canvas의 width 값
  // height: "100%", //  scene이 그려지는 canvas의 height 값
  // backgroundColor: '#EEEEEE', //  scene이 그려지는 canvas의 backgroundColor 값
  type: Phaser.AUTO,
  parent: 'codeuk',
  scene: [AirportScene],
  scale: {
    // mode: Phaser.Scale.FIT,
    mode: Phaser.Scale.ScaleModes.RESIZE,
    // width: window.innerWidth,
    // height: window.innerHeight,
    width: '100wh',
    height: '100vh',
  },
  physics: {
    default: 'matter',
    matter: {
      debug: true, // 배포 시 주석 처리 (메타버스 디버그 모드)
      gravity: { y: 0 },
    },
  },
  plugins: {
    scene: [pluginConfig],
  },
  pixelArt: true,
};

let phaserGame: GameType = new Phaser.Game(config);

export default phaserGame;
