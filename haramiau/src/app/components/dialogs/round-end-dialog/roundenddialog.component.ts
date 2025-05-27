import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ConfettiService } from '../../../services/confetti/confetti.service';
import { GameStatusService } from '../../../services/game-status/game-status.service';
import {
  GAMESTATUS,
  MAX_PLAYER_NAME_LENGTH_END_DIALOG,
  SESSION_NAMES,
  START_CHAR,
} from '../../../shared/constants';
import { RandomwordService } from '../../../services/random-word/randomword.service';
import { GameMasterService } from '../../../services/game-master/game-master.service';
import { CurrentTurnService } from '../../../services/current-turn/current-turn.service';

@Component({
  selector: 'app-roundenddialog',
  standalone: true,
  imports: [MatDialogContent, MatDialogModule, MatRipple, CommonModule],
  templateUrl: './roundenddialog.component.html',
  styleUrl: './roundenddialog.component.css',
})
export class RoundenddialogComponent {
  playerList: { name: string; score: number }[] = [];
  startChar = START_CHAR;
  maxPlayerNameLength = MAX_PLAYER_NAME_LENGTH_END_DIALOG;
  gameMaster = '';

  constructor(
    public dialogRef: MatDialogRef<RoundenddialogComponent>,
    private confettiService: ConfettiService,
    private gameStatusService: GameStatusService,
    private randomWordService: RandomwordService,
    private currentTurnService: CurrentTurnService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.playerList = Object.values(data.playerDatas); // Átalakítja objektumot tömbbé
    this.playerList.sort((a, b) => b.score - a.score);
    this.gameMaster = data.gameMaster;
  }

  endRound() {
    this.confettiService.firework();
    this.dialogRef.close();
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

  async nextRound() {
    if (sessionStorage.getItem(SESSION_NAMES.PLAYER_ID) == this.gameMaster) {
      const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
      const playerSize = Number(
        sessionStorage.getItem(SESSION_NAMES.PLAYER_SIZE)
      );
      await this.currentTurnService.resetTurn();
      if (roomId != null) {
        await this.randomWordService.createDeck(roomId, playerSize, 2);
        await this.gameStatusService.setGameStatus(GAMESTATUS.INACTIVE);
      }

      console.log(
        this.gameMaster +
          ' - ' +
          roomId +
          ' - ' +
          playerSize +
          ' - ' +
          sessionStorage.getItem(SESSION_NAMES.GAME_STATUS)
      );
    }
    this.dialogRef.close();
  }
}
