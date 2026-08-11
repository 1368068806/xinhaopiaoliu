import Phaser from 'phaser';
import type { InputFrame } from './types';

export class InputMapping {
  frame: InputFrame = { left: false, right: false, up: false, down: false, dash: false, pulse: false };
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private stickX = 0;
  private stickY = 0;

  constructor(private scene: Phaser.Scene) {}

  create(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;
    this.keys = kb.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,SPACE,SHIFT,J,E') as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;
  }

  setStick(x: number, y: number): void {
    this.stickX = x;
    this.stickY = y;
  }

  pressDash(): void {
    this.frame.dash = true;
  }

  pressPulse(): void {
    this.frame.pulse = true;
  }

  update(): void {
    const f = this.frame;
    f.left = this.keys.LEFT.isDown || this.keys.A.isDown || this.stickX < -0.2;
    f.right = this.keys.RIGHT.isDown || this.keys.D.isDown || this.stickX > 0.2;
    f.up = this.keys.UP.isDown || this.keys.W.isDown || this.stickY < -0.2;
    f.down = this.keys.DOWN.isDown || this.keys.S.isDown || this.stickY > 0.2;
    f.dash = f.dash || Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.keys.SHIFT);
    f.pulse = f.pulse || Phaser.Input.Keyboard.JustDown(this.keys.J) || Phaser.Input.Keyboard.JustDown(this.keys.E);
  }

  consume(): void {
    this.frame.dash = false;
    this.frame.pulse = false;
  }
}
