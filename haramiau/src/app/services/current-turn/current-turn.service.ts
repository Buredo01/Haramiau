import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Database, ref, onValue, update, get } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { SESSION_NAMES } from '../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class CurrentTurnService {

  private realtime : Database = inject(Database);
  private injector = inject(EnvironmentInjector);

   //constructor(private realtime: Database) { }
   
   /*
     getCurrentTurn(): Observable<number> {
       return new Observable<number>((observer) => {
         const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
         if (roomId !== null) {
           const turnRef = ref(this.realtime, `rooms/${roomId}/currentTurn`);
           onValue(turnRef, (snapshot) => {
             const currentTurn = snapshot.val();
             let turnString:string = currentTurn.toString();
             sessionStorage.setItem('currentTurn', turnString);
             observer.next(currentTurn || null);
           }, (error) => {
             observer.error(error);
           });
         } else {
           console.log("roomId is NULL");
           observer.complete();
         }
       });
     }
*/
      getCurrentTurn(): Observable<number> {
        return new Observable<number>((observer) => {
          runInInjectionContext(this.injector, () => {
            const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
            if (roomId !== null) {
              const turnRef = ref(this.realtime, `rooms/${roomId}/currentTurn`);
              const unsubscribe = onValue(
                turnRef,
                (snapshot) => {
                  const currentTurn = snapshot.val();
                  sessionStorage.setItem('currentTurn', currentTurn.toString());
                  observer.next(currentTurn ?? null);
                },
                (error) => {
                  observer.error(error);
                }
              );

              return () => unsubscribe(); // fontos: memóriaszivárgás elkerülése
            } else {
              console.warn("roomId is NULL");
              observer.complete();
              return;
            }
          });
        });
      }

      async updateTurn() {
        return runInInjectionContext(this.injector,async () => {
          const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
          const turnRef = ref(this.realtime, `rooms/${roomId}`);
          let turnNumber:number = await this.getTurn() + 1;
          let turnString:string = turnNumber.toString();
          sessionStorage.setItem(SESSION_NAMES.CURRENT_TURN, turnString);
          runInInjectionContext(this.injector,async () => {
            await update(turnRef,{currentTurn: turnNumber});
          });
        });
      }
     
      async getTurn(): Promise<number> {
        return runInInjectionContext(this.injector,async () => {
          const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
          const turnRef = ref(this.realtime, `rooms/${roomId}/currentTurn`);
          return runInInjectionContext(this.injector, async () => {
            const snapshot = await get(turnRef);
            return snapshot.val();
          });
        });
      }

      async resetTurn(): Promise<void> {
        return runInInjectionContext(this.injector,async () => {
          const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
          const turnRef = ref(this.realtime, `rooms/${roomId}`);
          return runInInjectionContext(this.injector, async () => {
            await update(turnRef,{currentTurn: 1});
          });
        });
      }
}
