import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Database, onValue, ref, update } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { SESSION_NAMES } from '../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class TippService {
  private realtime: Database = inject(Database);
  private injector = inject(EnvironmentInjector); 

  getTipps(): Observable<{ [key: string]: string }> {
    return new Observable<{ [key: string]: string }>((observer) => {
      runInInjectionContext(this.injector, () => {
      const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
      if (roomId !== null) {
        const tippRef = ref(this.realtime, `rooms/${roomId}/tipps`);
        const unsubscribe = onValue(
          tippRef,
          (snapshot) => {
            const tipps = snapshot.val();
            observer.next(tipps || {});
          },
          (error) => {
            console.log('There is no tipp yet!');
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

  async resetTipps() {
    return runInInjectionContext(this.injector, async () => {
      const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
      const tippRef = ref(this.realtime, `rooms/${roomId}`);
      update(tippRef, { tipps: {} });
    });
  }

  async updateTipp(tipp: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const roomRef = ref(
          this.realtime,
          `rooms/${sessionStorage.getItem(SESSION_NAMES.ROOM_ID)}/tipps`
        );

        const player = sessionStorage.getItem(SESSION_NAMES.PLAYER_ID);
        if (player) {
          await update(roomRef, {
            [player]: tipp,
          });
        }
      } catch (error) {
        console.error('Error updating tipp:', error);
      }
    });
  }
}
