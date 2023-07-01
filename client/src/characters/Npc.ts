export interface npcInfo {
    name: string;
    x: number;
    y: number;
    texture: string;
    sprite: Phaser.Physics.Arcade.Sprite | null;
    role: string;
    moving: boolean;
}