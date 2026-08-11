import Phaser from 'phaser';
import { getContract } from '../../game/contracts';
import { InputMapping } from '../../game/input';
import { loadSave, persistSave } from '../../game/save';
import { createRun, updateRun } from '../../game/simulation';
import type { Contract, RunEvent, RunState } from '../../game/types';
import { OBSTACLES, WORLD_H, WORLD_W, NODES, nodeIndex } from '../../game/world';
import { HudController } from '../../ui/hud';

export class RunScene extends Phaser.Scene {
  private contract!: Contract;
  private run!: RunState;
  private mapping!: InputMapping;
  private hud!: HudController;
  private playerSprite!: Phaser.GameObjects.Image;
  private packetSprite!: Phaser.GameObjects.Image;
  private ghostSprites: Phaser.GameObjects.Image[] = [];
  private cacheSprites: Phaser.GameObjects.Image[] = [];
  private dashEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private paused = false;
  private finished = false;

  constructor() {
    super('RunScene');
  }

  init(data: { contractId: string }): void {
    this.contract = getContract(data.contractId);
  }

  create(): void {
    const save = loadSave();
    this.run = createRun({ contract: this.contract, upgrades: save.upgrades });
    this.finished = false;
    this.paused = false;

    this.add.tileSprite(0, 0, WORLD_W, WORLD_H, 'water').setOrigin(0, 0).setAlpha(0.55);
    for (const block of OBSTACLES) {
      this.add.image(block.x + block.w / 2, block.y + block.h / 2, 'block').setDepth(-1);
    }

    const startNode = NODES[0];
    const destNode = NODES[nodeIndex(this.contract.destination.i, this.contract.destination.j)];
    this.add.image(startNode.x, startNode.y - 16, 'tower');
    this.add.image(destNode.x, destNode.y - 16, 'tower-dest');

    this.cacheSprites = this.run.caches.map((cache) => this.add.image(cache.x, cache.y, 'cache'));
    this.ghostSprites = this.run.ghosts.map((ghost) => this.add.image(ghost.x, ghost.y, `ghost-${ghost.variant}`));
    this.playerSprite = this.add.image(this.run.player.x, this.run.player.y, 'courier').setDepth(2);
    this.packetSprite = this.add.image(this.run.player.x + 18, this.run.player.y - 18, 'packet').setDepth(3);

    this.cameras.main.startFollow(this.playerSprite, true, 0.12, 0.12);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.centerOn(this.run.player.x, this.run.player.y);

    this.dashEmitter = this.add.particles(0, 0, 'glow', {
      speed: { min: 60, max: 170 },
      lifespan: 340,
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.9, end: 0 },
      blendMode: 'ADD',
    });

    this.mapping = new InputMapping(this);
    this.mapping.create();
    this.setupTouch();

    this.hud = new HudController(
      {
        onResume: () => this.setPaused(false),
        onQuit: () => this.returnToHub(),
      },
      this.contract.name,
    );
    this.hud.show();

    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-ESC', () => this.setPaused(!this.paused));
    }
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 0.05);
    this.mapping.update();
    if (this.paused || this.run.status !== 'running') {
      this.mapping.consume();
      return;
    }
    const events = updateRun(this.run, this.mapping.frame, dt);
    this.mapping.consume();
    for (const event of events) {
      this.handleEvent(event);
    }
    this.syncSprites();
    this.hud.update(this.run);
  }

  private handleEvent(event: RunEvent): void {
    switch (event.type) {
      case 'dash':
        this.dashEmitter.explode(10, this.run.player.x, this.run.player.y);
        break;
      case 'pulse':
        this.spawnRing(this.run.player.x, this.run.player.y, 'pulse-ring');
        break;
      case 'ghost-hit':
        this.hud.toast(event.message ?? '数据包受损');
        this.playerSprite.setTintFill(0xff5f6b);
        this.tweens.add({
          targets: this.playerSprite,
          duration: 180,
          onComplete: () => this.playerSprite.clearTint(),
        });
        this.cameras.main.shake(140, 0.006);
        this.dashEmitter.explode(6, event.x ?? this.run.player.x, event.y ?? this.run.player.y);
        break;
      case 'cache':
        this.hud.toast(event.message ?? '数据包修复');
        if (event.x !== undefined && event.y !== undefined) {
          this.spawnRing(event.x, event.y, 'cache-ring');
        }
        break;
      case 'delivered':
        this.finishRun(true);
        break;
      case 'failed':
        this.finishRun(false);
        break;
    }
  }

  private spawnRing(x: number, y: number, key: string): void {
    const ring = this.add.image(x, y, key).setScale(0.22).setAlpha(0.95).setDepth(5);
    this.tweens.add({
      targets: ring,
      scale: 1.3,
      alpha: 0,
      duration: 420,
      onComplete: () => ring.destroy(),
    });
  }

  private syncSprites(): void {
    this.playerSprite.setPosition(this.run.player.x, this.run.player.y);
    this.packetSprite.setPosition(this.run.player.x + 18, this.run.player.y - 18);
    this.packetSprite.setVisible(this.run.status === 'running');
    this.ghostSprites.forEach((sprite, index) => {
      const ghost = this.run.ghosts[index];
      sprite.setPosition(ghost.x, ghost.y);
      sprite.setAlpha(ghost.stunned > 0 ? 0.4 : 1);
    });
    this.cacheSprites.forEach((sprite, index) => {
      sprite.setVisible(!this.run.caches[index].used);
    });
  }

  private setPaused(value: boolean): void {
    this.paused = value;
    this.hud.setPaused(value);
  }

  private finishRun(success: boolean): void {
    if (this.finished) return;
    this.finished = true;
    const save = loadSave();
    let reward: number;
    let reason: string;
    if (success) {
      reward = this.contract.reward + Math.floor(this.run.integrity) * 2;
      reason = '数据包完整送达';
      save.delivered += 1;
      save.streak += 1;
      save.bestStreak = Math.max(save.bestStreak, save.streak);
    } else {
      reward = Math.floor(this.contract.reward * 0.2);
      reason = '数据包完整度归零';
      save.streak = 0;
    }
    save.bandwidth += reward;
    persistSave(save);
    this.hud.showResult(
      {
        success,
        reward,
        reason,
        contractName: this.contract.name,
        integrity: Math.floor(this.run.integrity),
        streak: save.streak,
      },
      () => this.returnToHub(),
    );
  }

  private returnToHub(): void {
    this.hud.hide();
    this.scene.start('HubScene');
  }

  private setupTouch(): void {
    const stick = document.getElementById('touch-stick');
    const dashBtn = document.getElementById('touch-dash');
    const pulseBtn = document.getElementById('touch-pulse');
    const controls = document.getElementById('touch-controls');
    if (!stick || !dashBtn || !pulseBtn || !controls) return;
    controls.classList.remove('hidden');

    let active = false;
    const move = (clientX: number, clientY: number) => {
      const rect = stick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const max = 42;
      const len = Math.hypot(dx, dy);
      if (len > max) {
        dx = (dx / len) * max;
        dy = (dy / len) * max;
      }
      this.mapping.setStick(dx / max, dy / max);
      stick.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    stick.addEventListener('pointerdown', (e) => {
      active = true;
      stick.setPointerCapture(e.pointerId);
      move(e.clientX, e.clientY);
    });
    stick.addEventListener('pointermove', (e) => {
      if (active) move(e.clientX, e.clientY);
    });
    stick.addEventListener('pointerup', () => {
      active = false;
      this.mapping.setStick(0, 0);
      stick.style.transform = '';
    });
    dashBtn.addEventListener('pointerdown', () => this.mapping.pressDash());
    pulseBtn.addEventListener('pointerdown', () => this.mapping.pressPulse());
  }
}
