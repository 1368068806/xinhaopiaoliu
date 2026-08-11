import Phaser from 'phaser';
import { OBSTACLES, WORLD_H, WORLD_W, NODES } from '../../game/world';
import { buildHub } from '../../ui/hub';

export class HubScene extends Phaser.Scene {
  constructor() {
    super('HubScene');
  }

  create(): void {
    this.add.tileSprite(0, 0, WORLD_W, WORLD_H, 'water').setOrigin(0, 0).setAlpha(0.55);
    for (const block of OBSTACLES) {
      this.add.image(block.x + block.w / 2, block.y + block.h / 2, 'block');
    }
    for (const node of NODES) {
      this.add.image(node.x, node.y - 16, 'tower');
    }
    this.cameras.main.centerOn(WORLD_W / 2, WORLD_H / 2);

    const overlay = document.getElementById('hub-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      buildHub(overlay, {
        onStart: (contractId: string) => {
          overlay.classList.add('hidden');
          this.scene.start('RunScene', { contractId });
        },
      });
    }
  }
}
