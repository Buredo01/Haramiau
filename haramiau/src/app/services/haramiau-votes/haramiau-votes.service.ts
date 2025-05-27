import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Database, ref, onValue, set, get } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { SESSION_NAMES } from '../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class HaramiauVotesService {

  private realtime: Database = inject(Database);
  private injector = inject(EnvironmentInjector);  

  getCurrentHaramiauVotes(): Observable<number> {
    return new Observable<number>((observer) => {
      runInInjectionContext(this.injector, () => {
      const roomId = sessionStorage.getItem('roomId');
      if (roomId !== null) {
        const roomRef = ref(this.realtime, `rooms/${roomId}/votes`);
        const unsubscribe = onValue(
          roomRef,
          (snapshot) => {
            const currentVotes = snapshot.val();
            observer.next(currentVotes || null);
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

  async updateHaramiauVotes(reset?: boolean) {
    runInInjectionContext(this.injector,async () => {
      try {
        const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
        const votesRef = ref(this.realtime, `rooms/${roomId}/votes`);

        const snapshot = await get(votesRef);
        const currentVotes = snapshot.exists() ? snapshot.val() : 0;

        runInInjectionContext(this.injector,async () => {
          if (reset === undefined) {
            await runInInjectionContext(this.injector, async () => {
              set(votesRef, currentVotes + 1);
            }); 
          } else if (reset === true) {
            await runInInjectionContext(this.injector, async () => {
             set(votesRef, 0);
            }); 
          }
        });
      } catch (error) {
        console.error('Error updating HaramiauVotes:', error);
        throw error;
      }
    });
  }
}
