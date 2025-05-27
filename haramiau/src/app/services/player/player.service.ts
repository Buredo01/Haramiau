import {
  EnvironmentInjector,
  inject,
  Injectable,
  runInInjectionContext,
} from '@angular/core';
import { Database, get, onValue, ref, update } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { SESSION_NAMES } from '../../shared/constants';
import { GameSettingsService } from '../game-settings/game-settings.service';

export interface Player {
  id: string;
  name: string;
  score: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private db: Database = inject(Database);
  private injector = inject(EnvironmentInjector);

  constructor(private gameSettingsService: GameSettingsService) {}

  async getPlayerSize(): Promise<number | undefined> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const roomRef = ref(
          this.db,
          `rooms/${sessionStorage.getItem(SESSION_NAMES.ROOM_ID)}/players`
        );
        const snapshot = await get(roomRef);
        let playerSize = snapshot.size;
        sessionStorage.setItem(
          SESSION_NAMES.PLAYER_SIZE,
          playerSize.toString()
        );
        return playerSize;
      } catch (error) {
        console.error('Error getting playerSize:', error);
        return;
      }
    });
  }

  getPlayers(): Observable<{ [key: string]: { name: string; score: number, avatar:number } }> {
    return new Observable((observer) => {
      runInInjectionContext(this.injector, () => {
        const path = `rooms/${sessionStorage.getItem(
          SESSION_NAMES.ROOM_ID
        )}/players`;
        const playersRef = ref(this.db, path);
        const unsubscribe = onValue(
          playersRef,
          (snapshot) => {
            const players = snapshot.val();
            observer.next(players || {});
          },
          (error) => {
            observer.error(error);
          }
        );

        return () => unsubscribe();
      });
    });
  }

  async updateAvatar(avatarId:number) {
    return runInInjectionContext(this.injector, async () => {
      try {
        const playerId = sessionStorage.getItem(SESSION_NAMES.PLAYER_ID);
        const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
        const playerRef = ref(this.db, `rooms/${roomId}/players/${playerId}`);
        await update(playerRef, {avatar: avatarId});
      } catch (error) {
        console.error('Error updating avatar: ' + error);
        throw error;
      }
    });
  }

  async updateScore(scoreData: { [key: string]: number }) {
    return runInInjectionContext(this.injector, async () => {
      try {
        await update(ref(this.db), scoreData);
      } catch (error) {
        console.error('Error updating score: ' + error);
        throw error;
      }
    });
  }

  async updateMinusScore(
    playerId: string,
    currentScore: number,
    haramiau: boolean
  ) {
    runInInjectionContext(this.injector, async () => {
      try {
        if (playerId) {
          const playerRef = ref(
            this.db,
            `rooms/${sessionStorage.getItem(
              SESSION_NAMES.ROOM_ID
            )}/players/${playerId}`
          );

          if (haramiau) {
            await update(playerRef, {
              score:
                currentScore +
                this.gameSettingsService.getHaramiauiMinusPoint(),
            });
          } else {
            await update(playerRef, {
              score:
                currentScore + this.gameSettingsService.getWordMinusPoint(),
            });
          }
        }
      } catch (error) {
        console.error('Error updating minus point:', error);
      }
    });
  }
}
