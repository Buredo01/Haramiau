import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WelcomedialogComponent } from './components/dialogs/welcome-dialog/welcomedialog.component';
import { TableComponent } from './components/table/table.component';
import { MatDialog } from '@angular/material/dialog';
import { QrCodeComponent } from 'ng-qrcode';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { RealtimeTestService } from './services/realtime-test/realtime-test.service';
import { Subscription } from 'rxjs';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { TimerService } from './services/timer/timer.service';
import { InviteLinkComponent } from './components/invite-link/invite-link.component';
import { MatIconModule } from '@angular/material/icon';
import { HintService } from './services/hint/hint.service';
import { TippService } from './services/tipp/tipp.service';
import { GameStatusService } from './services/game-status/game-status.service';
import { GameMasterService } from './services/game-master/game-master.service';
import { CurrentTurnService } from './services/current-turn/current-turn.service';
import { CurrentWordService } from './services/current-word/current-word.service';
import { PlayerService } from './services/player/player.service';
import { FRONTEND_STATUS, GAMESTATUS, SESSION_NAMES } from './shared/constants';
import { HaramiauPlayerService } from './services/haramiau-player/haramiau-player.service';
import { HaramiauVotesService } from './services/haramiau-votes/haramiau-votes.service';
import { InfoCardComponent } from './components/info-card/info-card.component';
import { EmoteService } from './services/emote/emote.service';
import { SidebarService } from './services/sidebar/sidebar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    TableComponent,
    InfoCardComponent,
    MatButtonModule,
    PlayerListComponent,
    InviteLinkComponent,
    MatInputModule,
    MatIconModule,
    QrCodeComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'haramiau';
  @Input() playerDatas: {
    [key: string]: { name: string; score: number; avatar: number };
  } = {};
  @Input() hints: string[] = [];
  @Input() hintCounter: number = 0;
  @Input() tipps: { [key: string]: string }[] | null = null;
  @Input() allEmote: { [key: string]: string }[] | null = null;
  @Input() gameStatus: string = '';
  @Input() currentGM: string = '';
  @Input() currentHaramiauPlayer: string = '';
  @Input() currentWord: {
    canGiveMinusPoints: boolean;
    numHints: number;
    word: string;
    playerId: string;
  } = { canGiveMinusPoints: false, numHints: 0, word: '', playerId: '' };
  @Input() currentTurn: number = 1;
  @Input() haramiauVotes: number = 0;
  @Input() isDisabled: boolean = true;
  @ViewChild('tippInput') tippInput!: ElementRef;

  currentRoom: string | null = null;
  currentId: string | null = null;

  showEmotes = false;
  showQrCode = false;
  emotes = ['😺', '😹', '🎉', '🙀', '😿'];
  isEmoteEnabled = false;

  link = '';
  qrSize = window.innerWidth * 0.3;

  private playerSubscription?: Subscription;
  private hintSubscription?: Subscription;
  private tippsSubscription?: Subscription;
  private gameStatusSubscription?: Subscription;
  private gameMasterSubscription?: Subscription;
  private curretntTurnSubscription?: Subscription;
  private currentWordSubscription?: Subscription;
  private haramiauPlayerSubscription?: Subscription;
  private haramiauVotesSubscription?: Subscription;
  private emoteSubscription?: Subscription;

  private sendPassSubscription?: Subscription;

  receivedIsUserGM: boolean = false;

  remainingTime: number = 0;

  constructor(
    private dialog: MatDialog,

    private realtimeTestService: RealtimeTestService,
    private playerService: PlayerService,
    private hintService: HintService,
    private tippService: TippService,

    private gameStatusService: GameStatusService,
    public gameMasterService: GameMasterService,
    public sidebarService: SidebarService,

    private turnService: CurrentTurnService,
    private wordService: CurrentWordService,

    public timerService: TimerService,
    public haramiauPlayerService: HaramiauPlayerService,
    public haramiauVotesService: HaramiauVotesService,

    public emoteService: EmoteService,

    private cdr: ChangeDetectorRef
  ) {}

  onTabClose = (event: BeforeUnloadEvent): void => {
    this.realtimeTestService.removePlayerFromRoom();
  };

  onDataReceived(data: boolean) {
    this.receivedIsUserGM = data;
  }

  ngOnInit(): void {
    window.addEventListener('beforeunload', this.onTabClose);
    sessionStorage.clear();
    localStorage.clear();
    this.openDialog();

    this.timerService.remainingTime$.subscribe((time) => {
      this.remainingTime = time;
      this.cdr.detectChanges();
    });
    this.checkMobileView();
  }

  ngOnDestroy(): void {
    this.playerSubscription?.unsubscribe();
    this.hintSubscription?.unsubscribe();
    this.tippsSubscription?.unsubscribe();
    this.gameStatusSubscription?.unsubscribe();
    this.gameMasterSubscription?.unsubscribe();
    this.curretntTurnSubscription?.unsubscribe();
    this.currentWordSubscription?.unsubscribe();
    this.sendPassSubscription?.unsubscribe();
    this.haramiauPlayerSubscription?.unsubscribe();
    this.haramiauVotesSubscription?.unsubscribe();
    this.emoteSubscription?.unsubscribe();

    sessionStorage.clear();
    localStorage.clear();

    window.removeEventListener('beforeunload', this.onTabClose);
  }

  public changeDisabledParent(b: boolean) {
    setTimeout(() => {
      this.isDisabled = b;
      this.cdr.detectChanges();
    }, 0);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(WelcomedialogComponent, {
      width: '300px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.currentRoom = result.roomName;
        this.currentId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
        this.subscribeToPlayers(this.currentRoom);
        this.subscribeTogameStatus();
        this.subscribeToGameMaster();
        this.subscribeToHints();
        this.subscribeToCurrentWord();
        this.subscribeToTipps();
        this.subscribeToCurrentTurn();
        this.subscribeToSendPass();
        this.subscribeToHaramiauPlayer();
        this.subscribeToHaramiauVotes();
        this.subscribeToEmotes();
      }
    });
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private subscribeToSendPass(): void {
    this.sendPassSubscription?.unsubscribe();

    this.sendPassSubscription = this.timerService.sendPass$.subscribe(() => {
      this.passTurn();
    });
  }

  private subscribeToPlayers(roomName: string | null): void {
    if (!roomName) return;

    this.playerSubscription?.unsubscribe();

    this.playerSubscription = this.playerService.getPlayers().subscribe({
      next: (players) => {
        this.realtimeTestService.setPlayerDatas(this.playerDatas);
        this.playerDatas = { ...players };
        let playerSize = Object.keys(this.playerDatas).length;
        sessionStorage.setItem(
          SESSION_NAMES.PLAYER_SIZE,
          playerSize.toString()
        );
        if (
          Object.keys(this.playerDatas).length == 0 &&
          !this.realtimeTestService.isLocalPlayerHost
        ) {
          window.alert('A host játékos kilépett!');
          setTimeout(() => {
            console.log('Szoba törölve, oldal újratöltése...');
            window.location.reload();
          }, 1000);
        }
      },
      error: (err) => console.error('Error fetching players:', err),
    });
  }

  private subscribeToHints(): void {
    this.hintSubscription?.unsubscribe();
    this.hintSubscription = this.hintService.getHints().subscribe({
      next: (result) => {
        this.hints = [...result];
        this.hintCounter = this.hints.length;
      },
      error: (err) => {
        console.error('Error fetching hints:', err);
      },
    });
  }

  private subscribeToTipps(): void {
    this.tippsSubscription?.unsubscribe();
    this.tippsSubscription = this.tippService.getTipps().subscribe({
      next: (result) => {
        this.tipps = [{ ...result }];
      },
      error: (err) => {
        console.error('Error fetching tipps:', err);
      },
    });
  }

  private subscribeToEmotes(): void {
    this.emoteSubscription?.unsubscribe();
    this.emoteSubscription = this.emoteService.getEmotes().subscribe({
      next: (result) => {
        this.allEmote = [{ ...result }];
      },
      error: (err) => {
        console.error('Error fetching emotes:', err);
      },
    });
  }

  private subscribeTogameStatus(): void {
    this.gameStatusSubscription?.unsubscribe();
    this.gameStatusSubscription = this.gameStatusService
      .getGameStatus()
      .subscribe({
        next: (result) => {
          this.gameStatus = result;
          sessionStorage.setItem(SESSION_NAMES.GAME_STATUS, result);
        },
        error: (err) => {
          console.error('Error fetching gameStatus:', err);
        },
      });
  }

  private subscribeToGameMaster(): void {
    this.gameMasterSubscription?.unsubscribe();
    this.gameMasterSubscription = this.gameMasterService
      .getCurrentGM()
      .subscribe({
        next: (result) => {
          this.currentGM = result;
          this.realtimeTestService.currentGM = result;
        },
        error: (err) => {
          console.error('Error fetching currentGM:', err);
        },
      });
  }

  private subscribeToHaramiauPlayer(): void {
    this.haramiauPlayerSubscription?.unsubscribe();
    this.haramiauPlayerSubscription = this.haramiauPlayerService
      .getCurrentHaramiauPlayer()
      .subscribe({
        next: (result) => {
          this.currentHaramiauPlayer = result;
        },
        error: (err) => {
          console.error('Error fetching currentHaramiauPlayer:', err);
        },
      });
  }

  private subscribeToHaramiauVotes(): void {
    this.haramiauVotesSubscription?.unsubscribe();
    this.haramiauVotesSubscription = this.haramiauVotesService
      .getCurrentHaramiauVotes()
      .subscribe({
        next: (result) => {
          this.haramiauVotes = result;
        },
        error: (err) => {
          console.error('Error fetching haramiauVotes:', err);
        },
      });
  }

  private subscribeToCurrentTurn(): void {
    this.curretntTurnSubscription?.unsubscribe();
    this.curretntTurnSubscription = this.turnService
      .getCurrentTurn()
      .subscribe({
        next: (result) => {
          this.currentTurn = result;
        },
        error: (err) => {
          console.error('Error fetching currentTurn:', err);
        },
      });
  }

  private subscribeToCurrentWord(): void {
    this.currentWordSubscription?.unsubscribe();
    this.currentWordSubscription = this.wordService.getCurrentWord().subscribe({
      next: (result) => {
        this.currentWord = { ...result };
      },
      error: (err) => {
        console.error('Error fetching current word:', err);
      },
    });
  }

  exitRoom(): void {
    this.realtimeTestService.removePlayerFromRoom();
    sessionStorage.clear();
    localStorage.clear();
    window.location.reload();
  }

  public sendText(text: string): void {
    const trimmedText = text.trim();

    if (trimmedText === '') {
      const message = this.receivedIsUserGM
        ? 'Kérlek írj be hintet!'
        : 'Kérlek írj be tippet!';
      window.alert(message);
      return;
    }

    if (trimmedText.includes(' ')) {
      window.alert('Csak egy szót adhatsz meg!');
      return;
    }

    this.timerService.stopTimer();

    this.realtimeTestService.sendText(trimmedText);
    this.tippInput.nativeElement.value = '';
    this.isDisabled = true;
    this.cdr.detectChanges();
    if (!this.realtimeTestService.isGM()) {
      sessionStorage.setItem(
        SESSION_NAMES.FRONTEND_STATE,
        FRONTEND_STATUS.WAIT_OTHERS
      );
    }
  }

  public passTurn(): void {
    this.timerService.stopTimer();
    this.realtimeTestService.sendText('no tipp');
    this.tippInput.nativeElement.value = '';
    this.isDisabled = true;
    this.cdr.detectChanges();
    if (!this.realtimeTestService.isGM()) {
      sessionStorage.setItem(
        SESSION_NAMES.FRONTEND_STATE,
        FRONTEND_STATUS.WAIT_OTHERS
      );
    }
  }

  toggleEmotes() {
    this.showEmotes = !this.showEmotes;
  }

  onEmoteClick(emote: string) {
    this.emoteService.updateEmotes(emote);
    this.isEmoteEnabled = true;
    setTimeout(() => {
      this.isEmoteEnabled = false;
    }, 1000);
  }

  toggleQrCode() {
    this.showQrCode = !this.showQrCode;
  }

  sidebarOpen = false;
  sidebarOpenright = false;
  isMobileView = false;
  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }
  toggleSidebarright() {
    this.sidebarService.toggleSidebarright();
  }

  private checkMobileView() {
    if (window.innerWidth <= 768) {
      this.isMobileView = true;
    } else {
      this.isMobileView = false;
    }
  }

  handleLink(receivedLink: string) {
    this.link = receivedLink;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    this.qrSize = window.innerWidth * 0.3;
    this.checkMobileView();
  }
}
