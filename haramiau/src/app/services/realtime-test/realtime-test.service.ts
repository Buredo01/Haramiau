import {
  EnvironmentInjector,
  inject,
  Injectable,
  NgZone,
  runInInjectionContext,
} from '@angular/core';
import { Database, ref, set, get, push, remove } from '@angular/fire/database';
import { MAX_ROOM_SIZE, SESSION_NAMES, GAMESTATUS } from '../../shared/constants';
import { GameStatusService } from './../game-status/game-status.service';
import { PlayerService } from './../player/player.service';
import { HintService } from './../hint/hint.service';
import { TippService } from './../tipp/tipp.service';
import { GameMasterService } from './../game-master/game-master.service';
import { BehaviorSubject } from 'rxjs';
import { CurrentWordService } from './../current-word/current-word.service';
import { CurrentTurnService } from './../current-turn/current-turn.service';

type PlayerDatas = {
  [key: string]: {
    name: string;
    score: number;
  };
};

@Injectable({
  providedIn: 'root',
})
export class RealtimeTestService {
  private playerDatas$ = new BehaviorSubject<PlayerDatas>({});
  private playerDatas: PlayerDatas = {};

  public currentGM: string = '';
  public isLocalPlayerHost: boolean = false;
  public playerSize: number = 0;

  private db: Database = inject(Database);
  private injector = inject(EnvironmentInjector);

  constructor(
    private gameStatusService: GameStatusService,
    private gameMasterService: GameMasterService,
    private playerService: PlayerService,
    private hintService: HintService,
    private tippService: TippService,
    private currentwordService: CurrentWordService,
    private turnService: CurrentTurnService,
    private zone: NgZone
  ) {}

  resetStorage() {
    sessionStorage.clear();
    localStorage.clear();
  }

  setPlayerDatas(data: PlayerDatas) {
    this.playerDatas = data;
    this.playerDatas$.next(data);
  }

  async createRoom(playerId: string, playerName: string, roomName: string) {
    return this.zone.run(() => {
      return runInInjectionContext(this.injector, async () => {
        const roomRef = push(ref(this.db, `rooms`));
        const roomId = roomRef.key;

        this.resetStorage();

        sessionStorage.setItem(SESSION_NAMES.ROOM_NAME, roomName);
        sessionStorage.setItem(SESSION_NAMES.ROOM_ID, roomId);
        sessionStorage.setItem(SESSION_NAMES.PLAYER_ID, playerId);
        sessionStorage.setItem(SESSION_NAMES.GAME_STATUS, GAMESTATUS.INACTIVE);
        sessionStorage.setItem(SESSION_NAMES.CURRENT_TURN, '0');

        this.isLocalPlayerHost = true;
        this.currentGM = playerId;

        const newRoom = {
          id: roomId,
          GM: playerId,
          name: roomName,
          host: playerId,
          players: {
            [playerId]: {
              name: playerName,
              score: 0,
              avatar:1,
            },
          },
          currentWord: {
            word: '',
            numHints: 0,
            canGiveMinusPoints: false,
            playerId: '',
          },
          currentTurn: 1,
          haramiauPlayer: '',
          votes: 0,
          gameStatus: GAMESTATUS.INACTIVE,
          deck: [''],
          hints: [],
          tipps: [],
        };

        set(roomRef, newRoom);
        set(ref(this.db, `roomNames/${roomName}`), roomId);
        return roomId;
      });
    });
  }

  async getRoomIdByName(roomName: string): Promise<string | null> {
    return runInInjectionContext(this.injector, async () => {
      const path = `roomNames/${roomName}`;
      const roomRef = ref(this.db, path);
      const snapshot = await get(roomRef);
      return snapshot.exists() ? snapshot.val() : null;
    });
  }

  async roomExists(roomName: string): Promise<boolean> {
    return runInInjectionContext(this.injector, async () => {
      const roomId = await this.getRoomIdByName(roomName);
      if (roomId) {
        sessionStorage.setItem(SESSION_NAMES.ROOM_ID, roomId);
        sessionStorage.setItem(SESSION_NAMES.ROOM_NAME, roomName);
        return true;
      }
      return false;
    });
  }

  async roomJoinable(): Promise<boolean> {
    return runInInjectionContext(this.injector, async () => {
      const gameStatus = await this.gameStatusService.getGameStatusOnce();
      if (gameStatus !== GAMESTATUS.INACTIVE) {
        this.resetStorage();
        window.alert('Ebben a szobában már elindult a játék!');
        window.location.reload();
        return false;
      }

      await this.playerService.getPlayerSize();
      if (this.playerSize >= MAX_ROOM_SIZE) {
        this.resetStorage();
        window.alert('Ez a szoba elérte a maximális létszámot!');
        window.location.reload();
        return false;
      }

      return true;
    });
  }

  async joinRoom(playerId: string, playerName: string) {
    return runInInjectionContext(this.injector, async () => {
      if (await this.roomJoinable()) {
        sessionStorage.setItem(SESSION_NAMES.PLAYER_ID, playerId);
        sessionStorage.setItem(SESSION_NAMES.CURRENT_TURN, '0');

        const path = `rooms/${sessionStorage.getItem(
          SESSION_NAMES.ROOM_ID
        )}/players/${playerId}`;
        const playerRef = await runInInjectionContext(
          this.injector,
          async () => {
            return ref(this.db, path);
          }
        );

        runInInjectionContext(this.injector, async () => {
          await set(playerRef, {
            name: playerName,
            score: 0,
            avatar:1,
          });
        });
      }
    });
  }

  getNextGmId(playerDatas?: PlayerDatas): string {
    let playerIds: string[] = [];
    if (playerDatas) {
      playerIds = Object.keys(playerDatas);
    } else {
      playerIds = Object.keys(this.playerDatas);
    }

    const currentGMIndex = playerIds.indexOf(this.currentGM);

    const nextGMIndex = (currentGMIndex + 1) % playerIds.length;

    const nextGMId = playerIds[nextGMIndex];

    return nextGMId;
  }

  async removePlayerFromRoom(): Promise<void> {
    if (this.isGM()) {
      this.tippService.resetTipps();
      this.hintService.resetHints();

      this.currentwordService.resetCurrentWord();

      this.gameMasterService.updateGM(this.getNextGmId(this.playerDatas));
    }

    const playerRef = ref(
      this.db,
      `rooms/${sessionStorage.getItem(
        'roomId'
      )}/players/${sessionStorage.getItem(SESSION_NAMES.PLAYER_ID)}`
    );
    const roomRef = ref(
      this.db,
      `rooms/${sessionStorage.getItem(SESSION_NAMES.ROOM_ID)}`
    );
    const roomNameRef = ref(
      this.db,
      `roomNames/${sessionStorage.getItem(SESSION_NAMES.ROOM_NAME)}`
    );

    const hostText =
      'A játékos (' +
      sessionStorage.getItem(SESSION_NAMES.PLAYER_ID) +
      ') és a szoba ( ' +
      sessionStorage.getItem(SESSION_NAMES.ROOM_ID) +
      ') és a szoba neve (' +
      sessionStorage.getItem(SESSION_NAMES.ROOM_NAME) +
      ') sikeresen törölve lett.';

    const playerText = `A játékos (${sessionStorage.getItem(
      SESSION_NAMES.PLAYER_ID
    )}) sikeresen törölve lett a szobából (${sessionStorage.getItem(
      'roomId'
    )}).`;

    //TODO: Temporary solution to keep the db clean
    remove(
      ref(
        this.db,
        `rooms/${sessionStorage.getItem(SESSION_NAMES.ROOM_ID)}/votes`
      )
    ),
      this.resetStorage();

    return this.isLocalPlayerHost
      ? await Promise.all([remove(roomRef), remove(roomNameRef)])
          .then(() => console.log(hostText))
          .catch((error) =>
            console.error('Hiba történt a törlés során:', error)
          )
      : remove(playerRef)
          .then(() => console.log(playerText))
          .catch((error) =>
            console.error('Hiba történt a törlés során:', error)
          );
  }

  generateInviteLink(): string {
    if (!sessionStorage.getItem(SESSION_NAMES.ROOM_ID)) {
      throw new Error('Nincs aktív szoba!');
    }
    const baseUrl = window.location.origin; // Az aktuális domain
    let roomName = sessionStorage.getItem(SESSION_NAMES.ROOM_NAME);
    if (roomName) {
      return `${baseUrl}/join/${encodeURIComponent(roomName)}`;
    }
    return baseUrl;
  }

  parseRoomFromUrl(): string | null {
    const path = window.location.pathname;
    const match = path.match(/\/join\/(.+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  public isGM(): boolean {
    return sessionStorage.getItem(SESSION_NAMES.PLAYER_ID) == this.currentGM;
  }

  public async sendText(text: string) {
    if (this.isGM()) {
      this.hintService.updateHint(text);
    } else {
      this.tippService.updateTipp(text);
    }
  }
}
