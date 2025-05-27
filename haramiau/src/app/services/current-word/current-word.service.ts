import {
  EnvironmentInjector,
  inject,
  Injectable,
  runInInjectionContext,
} from '@angular/core';
import { Database, ref, onValue, set } from '@angular/fire/database';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CurrentWordComponent } from '../../components/dialogs/current-word-dialog/current-word.component';
import { SESSION_NAMES } from '../../shared/constants';
import { remove } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class CurrentWordService {
  private injector = inject(EnvironmentInjector);
  private realtime = inject(Database);

  constructor(private dialog: MatDialog) {}

  getCurrentWord(): Observable<{
    canGiveMinusPoints: boolean;
    numHints: number;
    word: string;
    playerId: string;
  }> {
    return new Observable((observer) => {
      runInInjectionContext(this.injector, () => {
        const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
        if (roomId !== null) {
          const wordRef = ref(this.realtime, `rooms/${roomId}/currentWord`);
          const unsubscribe = onValue(
            wordRef,
            (snapshot) => {
              const currentWord = snapshot.val();
              observer.next(currentWord || null);
            },
            (error) => {
              observer.error(error);
            }
          );
          return () => unsubscribe();
        } else {
          console.log('roomId is NULL');
          observer.complete();
          return;
        }
      });
    });
  }

  async openWordDialog(
    currentWord: {
      canGiveMinusPoints: boolean;
      numHints: number;
      word: string;
      playerId: string;
    },
    playerList: {
      [key: string]: {
        name: string;
        score: number;
      };
    },
    gmId: string
  ): Promise<MatDialogRef<CurrentWordComponent, string | null>> {
    return this.dialog.open(CurrentWordComponent, {
      minWidth: 'fit-content',
      disableClose: true,
      data: { currentWord, playerList, gmId },
    });
  }

  async resetCurrentWord() {
    return runInInjectionContext(this.injector, async () => {
      const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
      const wordRef = ref(this.realtime, `rooms/${roomId}/currentWord`);
      await set(wordRef, {
        canGiveMinusPoints: false,
        numHints: 0,
        word: '',
        playerId: '',
      });
    });
  }

  async updateCurrentWordCorrectGuesser(correctGuesser: string) {
    return runInInjectionContext(this.injector, async () => {
      const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
      const wordRef = ref(
        this.realtime,
        `rooms/${roomId}/currentWord/playerId`
      );
      await set(wordRef, correctGuesser);
    });
  }
}
