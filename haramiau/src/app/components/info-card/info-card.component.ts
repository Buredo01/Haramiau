import { Component, HostListener, Input, SimpleChanges } from '@angular/core';
import { RealtimeTestService } from '../../services/realtime-test/realtime-test.service';
import {
  FRONTEND_STATUS,
  GAMESTATUS,
  SESSION_NAMES,
} from '../../shared/constants';
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { GameSettingsService } from '../../services/game-settings/game-settings.service';

@Component({
  selector: 'app-info-card',
  imports: [],
  templateUrl: './info-card.component.html',
  standalone: true,
  styleUrl: './info-card.component.css',
})
export class InfoCardComponent {
  @Input() gameStatus: string | null = null;

  @Input() currentWord: string | null = null;
  @Input() maxTipp: number | null = null;
  @Input() canGiveMinusPoints: boolean | null = null;

  @Input() currentTurn: number | null = null;
  @Input() hintCounter: number | null = null;
  @Input() hints: string[] = [];
  @Input() tipps: { [key: string]: string }[] | null = null;
  @Input() currentGM: string = '';

  isGM = false;
  status = 'Várakozás a ...';
  maxTurn = 0;

  constructor(
    private realtimeService: RealtimeTestService,
    public sidebarService: SidebarService,
    private gameSetting: GameSettingsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.sidebarService.sidebarOpenright$.subscribe((open) => {
      this.sidebarOpenright = open;
    });
  }
  async ngOnChanges(changes: SimpleChanges) {
    const status_before = sessionStorage.getItem(SESSION_NAMES.FRONTEND_STATE);

    //Beállítom a GMet
    if (changes['currentGM']) {
      this.isGM = this.realtimeService.isGM();
    }

    //Beállítom a sokszor használt értékeket
    const playerId = sessionStorage.getItem(SESSION_NAMES.PLAYER_ID);
    const playerSize = Number(
      sessionStorage.getItem(SESSION_NAMES.PLAYER_SIZE)
    );
    const tippsLength =
      this.tipps && this.tipps.length > 0
        ? Object.keys(this.tipps[0]).length
        : 0;
    const hintsLength = this.hints.length ?? 0;
    const hasTipped =
      this.tipps?.some((tipp) => playerId && tipp[playerId] !== undefined) ??
      false;

    this.maxTurn = playerSize * (await this.gameSetting.getTurn());
    // --- Kör vége ---
    if (this.gameStatus === GAMESTATUS.SHOWWORD) {
      sessionStorage.setItem(
        SESSION_NAMES.FRONTEND_STATE,
        FRONTEND_STATUS.END_ROUND
      );
    }

    // --- Szó még nincs választva ---
    else if (this.currentWord === '') {
      if (this.isGM) {
        sessionStorage.setItem(
          SESSION_NAMES.FRONTEND_STATE,
          FRONTEND_STATUS.CHOOSE_WORD
        );
      } else {
        sessionStorage.setItem(
          SESSION_NAMES.FRONTEND_STATE,
          FRONTEND_STATUS.WAIT_CHOOSE_WORD
        );
      }
    }

    // --- GM logika ---
    else if (this.isGM) {
      //Ha még nincs hint vagy a tippek elbírálása volt
      if (
        hintsLength === 0 ||
        status_before === FRONTEND_STATUS.PROCESS_TIPPS
      ) {
        sessionStorage.setItem(
          SESSION_NAMES.FRONTEND_STATE,
          FRONTEND_STATUS.GIVE_HINT
        );

        //Ha már megadtad a hintet de még nem érkezett be az összes tipp
      } else if (tippsLength < playerSize - 1) {
        sessionStorage.setItem(
          SESSION_NAMES.FRONTEND_STATE,
          FRONTEND_STATUS.WAIT_TIPPS
        );

        //Ha már megvan az összess tipp
      } else {
        sessionStorage.setItem(
          SESSION_NAMES.FRONTEND_STATE,
          FRONTEND_STATUS.PROCESS_TIPPS
        );
      }
    }

    // --- Player logika ---
    else {
      if (hintsLength === 0) {
        sessionStorage.setItem(
          SESSION_NAMES.FRONTEND_STATE,
          FRONTEND_STATUS.WAIT_HINT
        );
      } else if (!hasTipped) {
        sessionStorage.setItem(
          SESSION_NAMES.FRONTEND_STATE,
          FRONTEND_STATUS.GIVE_TIPP
        );
      } else if (tippsLength < playerSize - 1) {
        sessionStorage.setItem(
          SESSION_NAMES.FRONTEND_STATE,
          FRONTEND_STATUS.WAIT_OTHERS
        );
      } else {
        sessionStorage.setItem(
          SESSION_NAMES.FRONTEND_STATE,
          FRONTEND_STATUS.WAIT_PROCESS
        );
      }

      // Ha GM elbírálta és senki nem volt jó, újra várjuk a hintet
      if (status_before === FRONTEND_STATUS.WAIT_PROCESS) {
        sessionStorage.setItem(
          SESSION_NAMES.FRONTEND_STATE,
          FRONTEND_STATUS.WAIT_HINT
        );
      }
    }

    //A végégn beállítom a statet
    let fe_state = sessionStorage.getItem(SESSION_NAMES.FRONTEND_STATE);
    if (fe_state) {
      this.status = fe_state;
    }
    this.checkmobileview();
  }

  sidebarOpenright = false;
  isMobileView = false;
  toggleSidebar() {
    this.sidebarOpenright = !this.sidebarOpenright;
    if (window.innerWidth <= 768) {
      document.body.style.overflow = this.sidebarOpenright ? 'hidden' : '';
    }
  }
  private checkmobileview() {
    if (window.innerWidth <= 768) {
      this.isMobileView = true;
    }
  }
}
