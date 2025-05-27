import {
  EnvironmentInjector,
  inject,
  Injectable,
  runInInjectionContext,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameSettingsDialogComponent } from '../../components/dialogs/game-settings-dialog/game-settings-dialog.component';
import { GameSettings } from '../../shared/types';
import { Database, get, ref, set } from '@angular/fire/database';
import { SESSION_NAMES } from '../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class GameSettingsService {
  private realtime: Database = inject(Database);
  private injector = inject(EnvironmentInjector);

  settings: GameSettings = {
    turn: 2,
    isShowTip: true,
    hintTime: 30,
    tipTime: 30,
    chooseWordTime: 30,
    showWordTime: 10,
    evaluateTipsTime: 30,
    wordMinusPoint: -1,
    haramiauiMinusPoint: -4,
    ownWords: [],
  };

  constructor(private dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(GameSettingsDialogComponent, {
      width: '800px',
    });
  }

  getTurn(): number {
    return this.settings.turn;
  }

  setTurn(value: number): void {
    this.settings.turn = value;
  }

  getIsShowTip(): boolean {
    return this.settings.isShowTip;
  }

  setIsShowTip(value: boolean): void {
    this.settings.isShowTip = value;
  }

  getHintTime(): number {
    return this.settings.hintTime;
  }

  setHintTime(value: number): void {
    this.settings.hintTime = value;
  }

  getTipTime(): number {
    return this.settings.tipTime;
  }

  setTipTime(value: number): void {
    this.settings.tipTime = value;
  }

  getChooseWordTime(): number {
    return this.settings.chooseWordTime;
  }

  setChooseWordTime(value: number): void {
    this.settings.chooseWordTime = value;
  }

  getShowWordTime(): number {
    return this.settings.showWordTime;
  }

  setShowWordTime(value: number): void {
    this.settings.showWordTime = value;
  }

  getEvaluateTipsTime(): number {
    return this.settings.evaluateTipsTime;
  }

  setEvaluateTipsTime(value: number): void {
    this.settings.evaluateTipsTime = value;
  }

  getWordMinusPoint(): number {
    return this.settings.wordMinusPoint;
  }

  setWordMinusPoint(value: number): void {
    this.settings.wordMinusPoint = value;
  }

  getHaramiauiMinusPoint(): number {
    return this.settings.haramiauiMinusPoint;
  }

  setHaramiauiMinusPoint(value: number): void {
    this.settings.haramiauiMinusPoint = value;
  }

  getOwnWords(): string[] {
    return this.settings.ownWords;
  }

  setOwnWords(value: string[]): void {
    this.settings.ownWords = value;
  }

  async updateSettings(): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);

        if (!roomId) {
          console.error('Room ID not found in session storage.');
          return;
        }

        const settingsRef = ref(this.realtime, `rooms/${roomId}/settings`);

        await set(settingsRef, {
          turn: this.settings.turn,
          isShowTip: this.settings.isShowTip,
          hintTime: this.settings.hintTime,
          tipTime: this.settings.tipTime,
          chooseWordTime: this.settings.chooseWordTime,
          showWordTime: this.settings.showWordTime * 1000,
          evaluateTipsTime: this.settings.evaluateTipsTime,
          wordMinusPoint: this.settings.wordMinusPoint,
          haramiauiMinusPoint: this.settings.haramiauiMinusPoint,
        });
      } catch (error) {
        console.error('Hiba a beállítások mentésekor:', error);
      }
    });
  }

  async getSettings(): Promise<GameSettings | null> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
        if (!roomId) {
          console.error('Room ID not found in session storage.');
          return null;
        }

        const settingsRef = ref(this.realtime, `rooms/${roomId}/settings`);
        const snapshot = await get(settingsRef);

        if (snapshot.exists()) {
          this.settings = snapshot.val() as GameSettings;
          return this.settings;
        } else {
          console.log('Nincsenek mentett beállítások.');
          return null;
        }
      } catch (error) {
        console.error('Hiba a beállítások lekérésekor:', error);
        return null;
      }
    });
  }
}
