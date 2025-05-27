import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Database, ref, onValue, update, set } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { SESSION_NAMES } from '../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class GameMasterService {

  private injector = inject(EnvironmentInjector);
  private realtime = inject(Database);

  getCurrentGM(): Observable<string> {
    return new Observable<string>((observer) => {
      runInInjectionContext(this.injector, () => {
        const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
        if (roomId !== null) {
          const roomRef = ref(this.realtime, `rooms/${roomId}/GM`);
          const unsubscribe = onValue(
            roomRef,
            (snapshot) => {
              const currentGM = snapshot.val();
              observer.next(currentGM || null);
            },
            (error) => {
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

    async updateGM(id: string){
      runInInjectionContext(this.injector,async () => {
        try{
          const roomRef = ref(this.realtime, `rooms/${sessionStorage.getItem(SESSION_NAMES.ROOM_ID)}/GM`);
          await set(roomRef, id);
          
        }catch(error){
          console.error("Error updating score: "+ error);
          throw error;
        }
      });
    }
}
