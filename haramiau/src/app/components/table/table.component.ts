import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NgStyle, NgFor, NgIf, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { RandomwordService } from '../../services/random-word/randomword.service';
import { RealtimeTestService } from '../../services/realtime-test/realtime-test.service';
import { ConfettiService } from '../../services/confetti/confetti.service';
import { GameStatusService } from '../../services/game-status/game-status.service';
import { MatIconModule } from '@angular/material/icon';
import {
  FRONTEND_STATUS,
  GAMESTATUS,
  MAX_HINT_LENGTH_TABLE,
  MAX_PLAYER_NAME_LENGTH_TABLE,
  MIN_PLAYER_TO_START,
  SESSION_NAMES,
  START_CHAR,
  START_TIME,
  STATE_NAMES,
} from '../../shared/constants';
import { toInteger } from 'lodash';
import { TimerService } from '../../services/timer/timer.service';
import { AppComponent } from '../../app.component';
import { GameSettingsService } from '../../services/game-settings/game-settings.service';
import { Player } from '../../shared/types';
import { AvatarService } from '../../services/avatar/avatar.service';
import { EmoteService } from '../../services/emote/emote.service';

interface Chair {
  name?: string;
  avatar?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    NgStyle,
    NgFor,
    MatCardModule,
    NgIf,
    MatButton,
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent {
  @Input() playerDatas: { [key: string]: Player } = {};
  @Input() allEmote: { [key: string]: string }[] | null = null;
  @Input() hints: string[] = [];
  @Input() gameStatus: string = '';
  @Input() isDisabled: boolean = false;
  @Input() remainingTime: number = 0;
  @Output() sendDisabled = new EventEmitter<boolean>();

  chairs: Chair[] = [];
  crownVisible: { [key: number]: boolean } = {};
  tableWidth = Math.min(window.innerWidth * 0.7, 500);
  tableHeight = Math.min(window.innerHeight * 0.5, 300);
  chairSize = 50;
  chairDistance = 30;
  currentPlayerName: string = '';
  isMobileView: boolean = false;

  maxPlayerNameLength = MAX_PLAYER_NAME_LENGTH_TABLE;
  maxHintLength = MAX_HINT_LENGTH_TABLE;
  startChar = START_CHAR;

  isGM: boolean | null = null;
  playerSize = sessionStorage.getItem(SESSION_NAMES.PLAYER_SIZE);
  minPlayerToStart = MIN_PLAYER_TO_START;

  roomId: string | null = null; //Szoba id, sessionben van benne
  roundNumber: number = 2; // hány kör lesz
  playerNumber: number = 0; // hány játékos van

  hint1: string = '';
  hint2: string = '';
  hint3: string = '';
  hint4: string = '';
  hint5: string = '';
  hint6: string = '';

  constructor(
    private randomwordService: RandomwordService,
    private realtimeTestService: RealtimeTestService,
    private confettiService: ConfettiService,
    private gameStatusService: GameStatusService,
    public timerService: TimerService,
    private appservicekilep: AppComponent,
    private gameSettingsService: GameSettingsService,
    private cdr: ChangeDetectorRef,
    private avatarService: AvatarService,
    private emoteService: EmoteService
  ) {
    this.isGM = this.realtimeTestService.isGM();
  }

  status: string = 'Várakozás a ...';

  ngOnInit(): void {
    this.status =
      sessionStorage.getItem(SESSION_NAMES.FRONTEND_STATE) ??
      'Várakozás a játék elindítására...';

    setInterval(() => {
      const s = sessionStorage.getItem(SESSION_NAMES.FRONTEND_STATE);
      if (s && s !== this.status) {
        this.status = s;
      }
    }, 1000);
    this.timerService.remainingTime$.subscribe((time) => {
      this.remainingTime = time;
      this.cdr.detectChanges();
    });
  }

  ConvertToNumber(playerSize: string | null): number {
    return playerSize ? Number(playerSize) : 0;
  }

  startFireworks(): void {
    this.confettiService.firework();
  }

  getChairStyle(
    i: number,
    avatar?: string,
    name?: string
  ): { [key: string]: string } {
    const baseStyle = this.getChairPosition(i);

    const style: { [key: string]: string } = {
      ...baseStyle,
    };

    if (name && avatar) {
      style['background-image'] = `url(/avatars/${avatar})`;
      style['background-size'] = 'cover';
      style['background-position'] = 'center';
    }

    return style;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['playerDatas']) {
      this.playerSize = sessionStorage.getItem(SESSION_NAMES.PLAYER_SIZE);
      // Játékosokat székekhez rendeleli
      const playerList = Object.values(this.playerDatas);
      this.chairs = Array(12)
        .fill({})
        .map((_, i) => {
          const player = playerList[i];
          this.crownVisible[i] = false;
          setTimeout(() => {
            this.crownVisible[i] = true;
          }, 100);
          return {
            name: player?.name || '',
            avatar: player?.avatar + '.png',
          };
        });
    }

    if (changes['allEmote']) {
      if (this.allEmote) {
        this.allEmote.forEach((emoteObj) => {
          Object.values(emoteObj).forEach((emote) => {
            this.emoteService.spawnFloatingEmote(emote);
          });
        });

        this.emoteService.resetEmote();
      }
    }

    if (changes['hints']) {
      this.updateHintVariables();

      if (this.hint1 === '') {
        if (this.realtimeTestService.isGM()) {
          this.changeDisabledChild(false);
        } else {
          this.changeDisabledChild(true);
        }
      } else {
        if (!this.isGM && this.hint1 !== '') {
          this.timerService.startTimer(
            this.gameSettingsService.getTipTime(),
            STATE_NAMES.HINT_UPDATE
          );
          sessionStorage.setItem(
            SESSION_NAMES.FRONTEND_STATE,
            FRONTEND_STATUS.GIVE_TIPP
          );
        }
        if (this.realtimeTestService.isGM()) {
          this.changeDisabledChild(true);
        } else {
          this.changeDisabledChild(false);
        }
      }
    }

    this.isGM = this.realtimeTestService.isGM();

    this.updatePlayerInfo();
    this.checkMobileView();

    if (changes['playerDatas']) {
      this.playerSize = sessionStorage.getItem(SESSION_NAMES.PLAYER_SIZE);
    }
  }

  public changeDisabledChild(b: boolean) {
    this.sendDisabled.emit(b);
  }

  private updateHintVariables(): void {
    this.hint1 = this.hints[0] ?? '';
    this.hint2 = this.hints[1] ?? '';
    this.hint3 = this.hints[2] ?? '';
    this.hint4 = this.hints[3] ?? '';
    this.hint5 = this.hints[4] ?? '';
    this.hint6 = this.hints[5] ?? '';
  }

  @HostListener('window:resize')
  onResize() {
    this.tableWidth = Math.min(window.innerWidth * 0.7, 500);
    this.tableHeight = Math.min(window.innerHeight * 0.5, 300);
    this.checkMobileView();
  }

  getChairPosition(index: number) {
    const chairsPerShortSide = 2;
    const chairsPerLongSide = 4;
    const chairSpacingX = this.tableWidth / 4;
    const chairSpacingY = this.tableHeight / 3;

    let x = 0,
      y = 0;
    let textX = 0,
      textY = 0;
    let posInSide = 0,
      side = 0;

    if (index <= 5 || (index >= 8 && index <= 11)) {
      side = Math.floor(index / chairsPerLongSide);
      posInSide = (index % chairsPerLongSide) + 1;
    } else {
      side = Math.floor(index / chairsPerShortSide);
      posInSide = (index % chairsPerShortSide) + 1;
    }

    switch (side) {
      case 0: // Felső oldal
        x = posInSide * chairSpacingX - 85;
        y = -75;
        textX = x - 25;
        textY = y - 40;
        break;
      case 1: // Jobb oldal
        x = this.tableWidth + 35;
        y = posInSide * chairSpacingY - 25;
        textX = x - 25;
        textY = y - 40;
        break;
      case 2: // Alsó oldal
        x = posInSide * chairSpacingX - 85;
        y = this.tableHeight + 25;
        textX = x - 25;
        textY = y + 40;
        break;
      case 3: // Bal oldal
        x = -85;
        y = posInSide * chairSpacingY - 25;
        textX = x - 25;
        textY = y - 40;
        break;
    }

    const style: any = {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${this.chairSize}px`,
      height: `${this.chairSize}px`,
      namePosition: {
        position: 'absolute',
        left: `${textX}px`,
        top: `${textY}px`,
        textAlign: 'center',
        width: '100px',
      },
    };

    if (
      sessionStorage.getItem(SESSION_NAMES.PLAYER_ID) ===
      Object.keys(this.playerDatas).at(index)
    ) {
      style['background-color'] = '#c9a2ff';
      style['outline'] = '#ff0000 solid 3px';
    }

    return style;
  }

  getCurrentGMId(): string | null {
    return this.realtimeTestService.currentGM || null;
  }

  isChairGM(index: number): boolean {
    const playerIds = Object.keys(this.playerDatas);
    const gmId = this.getCurrentGMId();
    return playerIds[index] === gmId;
  }

  async onStart() {
    await this.gameSettingsService.updateSettings();
    this.roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
    if (this.playerSize) {
      this.playerNumber = toInteger(this.playerSize);
    } else {
      //Ha véletlenül a session null
      this.playerNumber = Object.keys(this.playerDatas).length;
    }
    if (this.roomId != null) {
      await this.randomwordService.createDeck(
        this.roomId,
        this.playerNumber,
        this.roundNumber
      );
      await this.gameStatusService.setGameStatus(GAMESTATUS.ACTIVE);
      this.updateHintVariables();
    } else {
      console.log('roomId is NULL');
    }
  }
  currentPlayerScore: number | null = null;
  private updatePlayerInfo() {
    const playerId = sessionStorage.getItem(SESSION_NAMES.PLAYER_ID);
    if (playerId && this.playerDatas[playerId]) {
      this.currentPlayerName = this.playerDatas[playerId].name;
      this.currentPlayerScore = this.playerDatas[playerId].score;
    }
  }
  private checkMobileView() {
    if (window.innerWidth <= 768) {
      this.isMobileView = true;
      this.tableWidth = Math.min(window.innerWidth * 0.7, 500);
      this.tableHeight = Math.min(window.innerHeight * 0.5, 500);
    } else {
      this.isMobileView = false;
    }
  }

  exit() {
    this.appservicekilep.exitRoom();
  }

  openSettings(): void {
    this.gameSettingsService.openDialog();
  }

  openAvatars(): void {
    this.avatarService.openDialog();
  }
}
