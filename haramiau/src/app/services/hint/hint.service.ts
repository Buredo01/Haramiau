import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import {
  Database,
  get,
  onValue,
  ref,
  set,
  update,
} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { SESSION_NAMES } from '../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class HintService {
  private hintCounter = 0;

  private realtime: Database = inject(Database);
  private injector = inject(EnvironmentInjector); 

  getHints(): Observable<string[]> {
    return new Observable<string[]>((observer) => {
      runInInjectionContext(this.injector, () => {
      const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
      if (roomId !== null) {
        const hintRef = ref(this.realtime, `rooms/${roomId}/hints`);
        const unsubscribe = onValue(
          hintRef,
          (snapshot) => {
            const hints = snapshot.val();
            observer.next(hints || []);
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

  async updateHint(hints: string): Promise<number> {
    return  runInInjectionContext(this.injector,async () => {
      try {
        const roomRef = ref(
          this.realtime,
          `rooms/${sessionStorage.getItem(SESSION_NAMES.ROOM_ID)}/hints`
        );
        await update(roomRef, { [this.hintCounter]: hints });
        this.hintCounter++;
      } catch (error) {
        console.error('Error updating hint:', error);
      } 
      return this.hintCounter;
    });
  }

  async resetHints() {
    return runInInjectionContext(this.injector,async () => {
      const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
      const hintRef = ref(this.realtime, `rooms/${roomId}`);
      update(hintRef, { hints: {} });
      this.hintCounter = 0;
    });
  }
}
