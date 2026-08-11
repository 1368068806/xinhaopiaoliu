import Phaser from 'phaser';
import { generateGameTextures } from '../textures';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    generateGameTextures(this);
    this.scene.start('HubScene');
  }
}
