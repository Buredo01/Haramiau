import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  private duration = 15 * 500;
  private defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
  };

  firework(): void {
    const canvas = document.getElementById(
      'confetti-canvas'
    ) as HTMLCanvasElement;

    if (!canvas) {
      console.error('Confetti canvas element not found!');
      return;
    }

    const confettiInstance = confetti.create(canvas, { resize: true });

    const animationEnd = Date.now() + this.duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / this.duration);
      confettiInstance({
        ...this.defaults,
        particleCount,
        origin: { x: this.randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confettiInstance({
        ...this.defaults,
        particleCount,
        origin: { x: this.randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
