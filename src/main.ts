import Phaser from 'phaser';
import { BootScene } from './phaser/scenes/BootScene';
import { HubScene } from './phaser/scenes/HubScene';
import { RunScene } from './phaser/scenes/RunScene';
import './style.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-canvas',
  width: '100%',
  height: '100%',
  backgroundColor: '#08141d',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, HubScene, RunScene],
};

new Phaser.Game(config);
