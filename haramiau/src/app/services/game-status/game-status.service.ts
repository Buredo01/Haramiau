import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Database, ref, onValue, set, get } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { SESSION_NAMES } from '../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class GameStatusService {
  
  private injector = inject(EnvironmentInjector);
  private realtime = inject(Database);
 
  getGameStatus(): Observable<string> {
    return new Observable<string>((observer) => {
      runInInjectionContext(this.injector, () => {
        const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
        if (roomId !== null) {
          const roomRef = ref(this.realtime, `rooms/${roomId}/gameStatus`);
          const unsubscribe = onValue(
            roomRef,
            (snapshot) => {
              const gameStatus = snapshot.val();
              observer.next(gameStatus);
            },
            (error) => {
              console.log("GAMESTATUS is empty!");
              observer.error(error);
            }
          );
          return () => unsubscribe();
        } else {
          console.log("roomId is NULL");
          observer.complete();
          return;
        }
      });
    });
  }

   async setGameStatus(status: string){
    return runInInjectionContext(this.injector, async () => {
      try {
          const roomRef = ref(
            this.realtime,
            `rooms/${sessionStorage.getItem(SESSION_NAMES.ROOM_ID)}/gameStatus`
          );
          sessionStorage.setItem('gameStatus', status);

          await set(roomRef, status);
        } catch (error) {
          console.error('Error activating room:', error);
        }
    });
   }

   async getGameStatusOnce() {
    return runInInjectionContext(this.injector, async () => {
      try {
        const roomRef = ref( this.realtime, `rooms/${sessionStorage.getItem(SESSION_NAMES.ROOM_ID)}/gameStatus`);
        const snapshot = await get(roomRef);
        const gameStatus = snapshot.val();

        sessionStorage.setItem(SESSION_NAMES.GAME_STATUS, gameStatus);
        return gameStatus;

      } catch (error) {

        console.error('Error getting gameStatus:', error);
      }
    });
   }
}
