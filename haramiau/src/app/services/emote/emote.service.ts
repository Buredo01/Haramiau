import {
  EnvironmentInjector,
  inject,
  Injectable,
  runInInjectionContext,
} from '@angular/core';
import {
  Database,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { SESSION_NAMES } from '../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class EmoteService {
  private realtime: Database = inject(Database);
  private injector = inject(EnvironmentInjector);

  getEmotes(): Observable<{ [key: string]: string }> {
    return new Observable<{ [key: string]: string }>((observer) => {
      runInInjectionContext(this.injector, () => {
        const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
        if (roomId !== null) {
          const emoteRef = ref(this.realtime, `rooms/${roomId}/emotes`);
          const unsubscribe = onValue(
            emoteRef,
            (snapshot) => {
              const emotes = snapshot.val();
              observer.next(emotes || {});
            },
            (error) => {
              console.log('There is no emote yet!');
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

  async resetEmote() {
    return runInInjectionContext(this.injector, async () => {
      const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
      const emoteRef = ref(this.realtime, `rooms/${roomId}/emotes`);

      remove(emoteRef);
    });
  }

  async updateEmotes(emote: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const roomRef = ref(
          this.realtime,
          `rooms/${sessionStorage.getItem(SESSION_NAMES.ROOM_ID)}/emotes`
        );

        await push(roomRef, emote);
      } catch (error) {
        console.error('Error updating emote:', error);
      }
    });
  }

  //Animáció
  private flyingEmotes: any[] = [];

  spawnFloatingEmote(symbol: string) {
    const id = Date.now();
    const x = Math.random() * window.innerWidth;
    const y = 0;
    const rotate = Math.random() * 360;
    const direction = Math.random() > 0.5 ? 'left' : 'right';

    this.flyingEmotes.push({
      symbol,
      x,
      y,
      id,
      rotate,
      direction,
    });

    setTimeout(() => {
      this.flyingEmotes = this.flyingEmotes.filter((e) => e.id !== id);
    }, 4000);
  }

  getFlyingEmotes() {
    return this.flyingEmotes;
  }
}
