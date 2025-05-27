import {
  EnvironmentInjector,
  inject,
  Injectable,
  NgZone,
  runInInjectionContext,
} from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { Database, ref, set, get } from '@angular/fire/database';
import _ from 'lodash';
import { WorddialogComponent } from '../../components/dialogs/word-dialog/worddialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CurrentTurnService } from '../current-turn/current-turn.service';
import { SESSION_NAMES } from '../../shared/constants';
import { GameSettingsService } from '../game-settings/game-settings.service';

@Injectable({
  providedIn: 'root',
})
export class RandomwordService {
  private wordsRef;

  private db: Firestore = inject(Firestore);
  private realtime: Database = inject(Database);
  private injector: EnvironmentInjector = inject(EnvironmentInjector);

  constructor(
    private dialog: MatDialog,
    private zone: NgZone,
    private turnService: CurrentTurnService,
    private gameSettingsService: GameSettingsService
  ) {
    this.wordsRef = collection(this.db, 'words');
  }

  async createDeck(roomId: string, players: number, rounds: number) {
    return this.zone.run(() => {
      return runInInjectionContext(this.injector, async () => {
        //Játékos szám * kör * 2 szó fog összesen kelleni
        let neededWordCount =
          this.gameSettingsService.getTurn() * players * rounds;

        //Lekéem a szavakat az adatbázisból
        const snapshot = await getDocs(this.wordsRef);
        const words = snapshot.docs.map((doc) => doc.data()['name']);

        if (words.length < neededWordCount) {
          throw new Error('Nincs elég szó az adatbázisban!');
        }

        //Összekeverem a szavakat
        let shuffledWords = _.shuffle(words);

        let ownDeck: string[] = [];
        if (
          this.gameSettingsService.getOwnWords() &&
          this.gameSettingsService.getOwnWords().length > 0
        ) {
          ownDeck = this.gameSettingsService.getOwnWords();

          if (ownDeck.length >= neededWordCount) {
            ownDeck = _.shuffle(ownDeck);

            shuffledWords = ownDeck.slice(0, neededWordCount);
          } else {
            neededWordCount -= ownDeck.length;

            //Kiveszek annyi szót amiennyi elég lesz a játékhoz
            const selectedWords = shuffledWords.slice(0, neededWordCount);

            const combined: string[] = ownDeck.concat(selectedWords);

            shuffledWords = _.shuffle(combined);
          }
        }

        runInInjectionContext(this.injector, async () => {
          //Elmentem adatbázisba a kiválasztott szavakat
          await set(ref(this.realtime, `rooms/${roomId}/deck`), shuffledWords);
        });

        return shuffledWords;
      });
    });
  }

  //Ezt csak teszteléshez használd
  async getDeck(roomId: string) {
    return runInInjectionContext(this.injector, async () => {
      //Lekérem a szábához tartozó decket
      const deckRef = ref(this.realtime, `rooms/${roomId}/deck`);
      const snapshot = await get(deckRef);
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log('Nincs deck');
        return null;
      }
    });
  }

  async getNextTwo(roomId: string) {
    return runInInjectionContext(this.injector, async () => {
      try {
        const currentTurn: number = await this.turnService.getTurn();
        const index1 = currentTurn * 2 - 2; // -2, mert 0-tól van az index
        const index2 = index1 + 1;

        const wordRef1 = await runInInjectionContext(
          this.injector,
          async () => {
            return ref(this.realtime, `rooms/${roomId}/deck/${index1}`);
          }
        );

        const wordRef2 = await runInInjectionContext(
          this.injector,
          async () => {
            return ref(this.realtime, `rooms/${roomId}/deck/${index2}`);
          }
        );

        const snapshot1 = await runInInjectionContext(
          this.injector,
          async () => {
            return get(wordRef1);
          }
        );

        const snapshot2 = await runInInjectionContext(
          this.injector,
          async () => {
            return get(wordRef2);
          }
        );

        if (snapshot1.exists() && snapshot2.exists()) {
          return [snapshot1.val(), snapshot2.val()];
        } else {
          console.log('Nincs elég szó a deckben');
          return null;
        }
      } catch (error) {
        console.error('Hiba történt a szavak lekérésekor:', error);
        throw error;
      }
    });
  }

  async saveWord(roomId: string, word: string, point: number) {
    return runInInjectionContext(this.injector, async () => {
      if (roomId != null && word != null && point != null) {
        if (point <= 0 || point > 6) {
          console.log('Nem 1 és 6 közötti a pont');
        } else {
          const roomRef = ref(this.realtime, `rooms/${roomId}/currentWord`);

          const isMinus = Math.random() < 0.3;

          if (isMinus) {
            await set(roomRef, {
              canGiveMinusPoints: isMinus,
              numHints: point,
              word: word,
              playerId: '',
            });
          } else {
            await set(roomRef, {
              canGiveMinusPoints: isMinus,
              numHints: point,
              word: word,
            });
          }
        }
      }
    });
  }

  async openWordDialog(): Promise<void> {
    const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
    if (roomId != null) {
      const getWords = await this.getNextTwo(roomId);

      if (!getWords || getWords.length < 2) {
        console.error('Hiba: Nincs elég szó a lekérés során!');
        return;
      }

      const randomWords = {
        word1: getWords[0],
        number1: Math.floor(Math.random() * 6) + 1,
        word2: getWords[1],
        number2: Math.floor(Math.random() * 6) + 1,
      };
      const dialogRef = this.dialog.open(WorddialogComponent, {
        minWidth: 'fit-content',
        disableClose: true,
        data: randomWords,
      });
    } else {
      console.log('roomId is NULL');
    }
  }
}
