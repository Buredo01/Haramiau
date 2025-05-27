import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  EventEmitter,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RealtimeTestService } from '../../services/realtime-test/realtime-test.service';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { CurrentWordService } from '../../services/current-word/current-word.service';
import { TippService } from '../../services/tipp/tipp.service';
import { RandomwordService } from '../../services/random-word/randomword.service';
import { CurrentTurnService } from '../../services/current-turn/current-turn.service';
import { EnddialogService } from '../../services/end-dialog/enddialog.service';
import { GameStatusService } from '../../services/game-status/game-status.service';
import { PlayerService } from '../../services/player/player.service';
import { HintService } from '../../services/hint/hint.service';
import { GameMasterService } from '../../services/game-master/game-master.service';
import {
  GAMESTATUS,
  MAX_PLAYER_NAME_LENGTH_LIST,
  MAX_TIP_LENGTH_LIST,
  SESSION_NAMES,
  SHOW_WORD_DIALOG_TIME,
  START_CHAR,
  START_TIME,
  STATE_NAMES,
} from '../../shared/constants';
import { HaramiauVotesService } from '../../services/haramiau-votes/haramiau-votes.service';
import { HaramiauPlayerService } from '../../services/haramiau-player/haramiau-player.service';
import { TimerService } from '../../services/timer/timer.service';
import { Subscription } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { GamerulesDialogComponent } from '../../components/dialogs/gamerules-dialog/gamerules-dialog.component';
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { GameSettingsService } from '../../services/game-settings/game-settings.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css'],
  standalone: true,
  imports: [CommonModule, KeyValuePipe, FormsModule, MatIcon],
})
export class PlayerListComponent implements OnInit, OnDestroy {
  @Input() playerDatas: {
    [key: string]: { name: string; score: number; avatar: number };
  } = {};
  @Input() currentGM: string = '';
  @Input() currentHaramiauPlayer: string = '';
  @Input() haramiauVotes: number = 0;
  @Input() currentWord: {
    canGiveMinusPoints: boolean;
    numHints: number;
    word: string;
    playerId: string;
  } = {
    canGiveMinusPoints: false,
    numHints: 0,
    word: '',
    playerId: '',
  };
  @Input() gameStatus: string = '';
  @Input() tipps: { [key: string]: string }[] | null = null;
  @Input() hintCounter: number = 0;
  @Input() isDisabled: boolean = true;
  @Output() sendDisabled = new EventEmitter<boolean>();

  private roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
  playerId = sessionStorage.getItem(SESSION_NAMES.PLAYER_ID);

  private playerCount = 0;
  playerTipps: { [key: string]: string } | null = null;
  playerVotes: { [key: string]: string } = {};
  playerRanks: { [key: string]: number } = {};

  allVotesCompleted = false;
  evaluationCompleted = false;
  hasCorrectGuess = false;
  isFinalHint = false;
  isUserGM = false;
  gmId = '';
  correctGuesserId: string | undefined = '';
  isProcessingRound = false;
  isShowTip = true;
  isAllTipSent = false;

  maxPlayerNameLength = MAX_PLAYER_NAME_LENGTH_LIST;
  maxTipLength = MAX_TIP_LENGTH_LIST;
  startChar = START_CHAR;

  @Output() isUserGMOutput: EventEmitter<boolean> = new EventEmitter();

  private previousWord = '';
  private selectedPlayerId: string | null | undefined = '';
  currentScores: { [key: string]: number } = {};
  scoreUpdates: { [key: string]: number } = {};

  constructor(
    private realtimeTestService: RealtimeTestService,
    private playerService: PlayerService,

    private wordService: RandomwordService,
    private currentwordService: CurrentWordService,

    private tippService: TippService,
    private hintService: HintService,

    private turnService: CurrentTurnService,
    private gameStatusService: GameStatusService,
    private gameMasterService: GameMasterService,

    private endService: EnddialogService,
    private haramiauVotesService: HaramiauVotesService,
    private haramiauPlayerService: HaramiauPlayerService,

    public timerService: TimerService,
    private sidebarService: SidebarService,

    private gameSettingsService: GameSettingsService,

    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private dialog: MatDialog
  ) {
    let id = this.realtimeTestService.currentGM;
    if (id) {
      this.gmId = id;
    }
  }

  private gmSwitchSubscription?: Subscription;

  async ngOnInit(): Promise<void> {
    await this.gameSettingsService.getSettings();

    this.isShowTip = this.gameSettingsService.getIsShowTip();

    if (this.gmId == this.playerId) {
      this.isUserGM = true;
      this.isUserGMOutput.emit(true);
    }
    this.playerCount = Object.keys(this.playerDatas).length;

    this.gmSwitchSubscription = this.timerService.gmSwitch$.subscribe(() => {
      this.updatesAndResets();
    });

    this.sidebarService.sidebarOpen$.subscribe((open) => {
      this.sidebarOpen = open;
    });
  }

  ngDoCheck(): void {
    if (this.currentWord.word !== this.previousWord) {
      this.previousWord = this.currentWord.word;
    }
  }

  async ngOnChanges(changes: SimpleChanges) {
    //GAMESTATUS
    if (changes['gameStatus']) {
      if (this.gameStatus == GAMESTATUS.END) {
        setTimeout(async () => {
          await this.playerService.updateMinusScore(
            this.currentHaramiauPlayer,
            this.currentScores[this.currentHaramiauPlayer],
            true
          );

          await this.haramiauPlayerService.updateHaramiauPlayer('');
        });

        setTimeout(async () => {
          await this.endService.openEndDialog(
            this.playerDatas,
            await this.realtimeTestService.getNextGmId(this.playerDatas)
          );
        });
      } else if (this.gameStatus == GAMESTATUS.SHOWWORD) {
        setTimeout(async () => {
          const dialogRef = await this.currentwordService.openWordDialog(
            this.currentWord,
            this.playerDatas,
            this.gmId
          );

          this.selectedPlayerId = await dialogRef.afterClosed().toPromise();

          if (
            this.selectedPlayerId !== null &&
            this.selectedPlayerId !== undefined
          ) {
            await this.getAndCalculateScores();

            this.playerService.updateMinusScore(
              this.selectedPlayerId,
              this.currentScores[this.selectedPlayerId],
              false
            );
          }
        });
      }
      this.checkmobileview();
    }

    //CURRENTGM
    if (
      changes['currentGM'] &&
      sessionStorage.getItem(SESSION_NAMES.GAME_STATUS) !== GAMESTATUS.INACTIVE
    ) {
      this.gmId = this.realtimeTestService.currentGM;
      this.isUserGM = this.realtimeTestService.isGM();
      this.isUserGMOutput.emit(this.isUserGM);

      this.cdr.detectChanges();

      if (
        sessionStorage.getItem(SESSION_NAMES.GAME_STATUS) ===
          GAMESTATUS.ACTIVE &&
        this.isUserGM
      ) {
        await this.wordService.openWordDialog();
        this.sendDisabled.emit(false);
      }
      await this.haramiauVotesService.updateHaramiauVotes(true);
      this.cdr.detectChanges();
    }

    //HINTS
    if (changes['hintCounter'] && this.currentWord.numHints > 0) {
      if (this.hintCounter == this.currentWord.numHints) {
        this.isFinalHint = true;
      } else {
        this.isFinalHint = false;
      }
    }

    //TIPPS
    if (changes['tipps'] && this.tipps) {
      this.playerTipps = Object.assign({}, ...this.tipps);

      if (Object.keys(this.tipps[0]).length == this.playerCount - 1) {
        this.isAllTipSent = true;
        if (this.isUserGM) {
          this.sidebarOpen = true;
          this.timerService.startTimer(
            this.gameSettingsService.getEvaluateTipsTime(),
            STATE_NAMES.TIP_UPDATE
          );
        }
      } else {
        this.isAllTipSent = false;
      }

      Object.keys(this.playerVotes).forEach((key) => {
        const tip = this.getPlayerTip(key);
        if (tip === 'no tipp') {
          this.playerVotes[key] = 'deny';
          this.checkVotesChanged();
        }
      });
    }

    //HARAMIAU

    this.playerCount = Number(
      sessionStorage.getItem(SESSION_NAMES.PLAYER_SIZE)
    );

    if (
      changes['haramiauVotes'] &&
      this.gameStatus == GAMESTATUS.SHOWWORD &&
      this.haramiauVotes == this.playerCount - 1 &&
      sessionStorage.getItem(SESSION_NAMES.PLAYER_ID) !==
        this.currentHaramiauPlayer
    ) {
      setTimeout(async () => {
        await this.haramiauPlayerService.updateHaramiauPlayer(this.currentGM);
        await this.haramiauVotesService.updateHaramiauVotes(true);
      });
    }

    //RANKS
    if (changes['playerDatas'] || changes['gameStatus']) {
      this.updatePlayerRanks();
    }
  }

  getAvatarByIndex(index: number): string {
    const avatarNumber = ((index % 12) + 1).toString().padStart(2, '0');
    return `/avatars/${avatarNumber}.png`;
  }

  checkVotesChanged(): void {
    const nonGmPlayers = Object.keys(this.playerDatas).filter(
      (id) => id !== this.gmId
    );

    this.allVotesCompleted = nonGmPlayers.every(
      (id) =>
        this.playerVotes[id] === 'accept' || this.playerVotes[id] === 'deny'
    );

    this.hasCorrectGuess = nonGmPlayers.some(
      (id) => this.playerVotes[id] === 'accept'
    );

    this.correctGuesserId = nonGmPlayers.find(
      (id) => this.playerVotes[id] === 'accept'
    );

    if (this.allVotesCompleted) this.evaluationCompleted = true;
  }

  private async updateGameState() {
    if (this.roomId) {
      await this.tippService.resetTipps();
    } else {
      console.log('There is no roomId');
    }
  }

  nextRound(): void {
    this.timerService.startTimer(
      this.gameSettingsService.getHintTime(),
      STATE_NAMES.NEXT_ROUND_UPDATE
    );
    this.sidebarOpen = false;
    this.resetForNextRound();
    this.updateGameState();
  }

  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getAndCalculateScores(): Promise<void> {
    Object.entries(this.playerDatas).forEach(
      ([playerId, playerData]: [string, any]) => {
        this.currentScores[playerId] = playerData.score || 0;
      }
    );

    const isMaxHintReached = this.hintCounter >= this.currentWord.numHints;

    this.scoreUpdates = Object.fromEntries(
      Object.keys(this.playerVotes).map((id) => {
        const currentScore = Number(this.currentScores[id]) || 0;

        const hints = isMaxHintReached
          ? this.currentWord.numHints
          : this.hintCounter || 0;

        const newScore =
          this.playerVotes[id] === 'accept'
            ? currentScore + hints
            : currentScore;

        return [`/rooms/${this.roomId}/players/${id}/score`, newScore];
      })
    );

    if (isMaxHintReached && this.gmId) {
      const gmScore =
        (Number(this.currentScores[this.gmId]) || 0) +
        this.currentWord.numHints;
      this.scoreUpdates[`/rooms/${this.roomId}/players/${this.gmId}/score`] =
        gmScore;
    }
  }

  async completeRound(): Promise<void> {
    if (!this.evaluationCompleted)
      return alert('Please evaluate all players first!');

    if (!this.roomId || this.isProcessingRound) return;

    this.isProcessingRound = true; // Jelezzük, hogy elkezdődött a feldolgozás

    this.timerService.stopTimer();
    if (this.correctGuesserId !== undefined)
      await this.currentwordService.updateCurrentWordCorrectGuesser(
        this.correctGuesserId
      );

    this.sidebarOpen = false;
    await this.getAndCalculateScores();

    await this.gameStatusService.setGameStatus(GAMESTATUS.SHOWWORD);

    await this.sleep(this.gameSettingsService.getShowWordTime());

    await this.playerService.updateScore(this.scoreUpdates);

    await this.updatesAndResets();

    this.isProcessingRound = false;
  }

  async updatesAndResets() {
    let currentTurn: number = Number(
      sessionStorage.getItem(SESSION_NAMES.CURRENT_TURN)
    );
    let playerSize = Number(sessionStorage.getItem(SESSION_NAMES.PLAYER_SIZE));
    if (
      playerSize &&
      currentTurn >= playerSize * this.gameSettingsService.getTurn() &&
      currentTurn > 0
    ) {
      await this.gameStatusService.setGameStatus(GAMESTATUS.END);
    } else if (this.gameStatus !== GAMESTATUS.ACTIVE) {
      this.gameStatusService.setGameStatus(GAMESTATUS.ACTIVE);
    }

    await this.turnService.updateTurn();

    await this.tippService.resetTipps();
    await this.hintService.resetHints();

    await this.currentwordService.resetCurrentWord();

    await this.gameMasterService.updateGM(
      this.realtimeTestService.getNextGmId(this.playerDatas)
    );

    this.zone.run(() => {
      this.resetForNextRound();
      this.isUserGM = false;
      this.isUserGMOutput.emit(this.isUserGM);
      this.cdr.detectChanges();
    });

    this.sendDisabled.emit(true);
  }

  private updatePlayerRanks(): void {
    const sortedEntries = Object.entries(this.playerDatas).sort(
      ([, a], [, b]) => b.score - a.score
    );

    this.playerRanks = {};
    sortedEntries.forEach(([id], index) => {
      this.playerRanks[id] = index;
    });
  }

  private resetForNextRound(): void {
    this.playerVotes = {};
    this.evaluationCompleted = false;
    this.hasCorrectGuess = false;
    this.isFinalHint = false;
    this.allVotesCompleted = false;
    this.isProcessingRound = false;
    this.sendDisabled.emit(false);
  }

  getPlayerTip(playerId: string): string {
    return this.playerTipps ? this.playerTipps[playerId] || '' : '';
  }

  ngOnDestroy(): void {
    this.gmSwitchSubscription?.unsubscribe();
  }

  openDialog() {
    const dialogRef = this.dialog.open(GamerulesDialogComponent, {
      width: '600px',
      disableClose: false,
    });
  }

  //Mobil-View
  sidebarOpen = false;
  isMobileView = false;
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (window.innerWidth <= 768) {
      document.body.style.overflow = this.sidebarOpen ? 'hidden' : '';
    }
  }
  private checkmobileview() {
    if (window.innerWidth <= 768) {
      this.isMobileView = true;
    }
  }
}
