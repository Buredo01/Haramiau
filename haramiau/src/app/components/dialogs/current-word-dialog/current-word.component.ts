import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  SESSION_NAMES,
  SHOW_WORD_DIALOG_TIME,
  STATE_NAMES,
} from '../../../shared/constants';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HaramiauVotesService } from '../../../services/haramiau-votes/haramiau-votes.service';
import { TimerService } from '../../../services/timer/timer.service';
import { GameSettingsService } from '../../../services/game-settings/game-settings.service';

@Component({
  selector: 'app-current-word',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './current-word.component.html',
  styleUrl: './current-word.component.css',
})
export class CurrentWordComponent {
  selectedPlayerId: string = '';
  selectedPlayer: boolean = false;
  votedHaramiau: boolean = false;

  currentWord!: {
    word: string;
    numHints: number;
    canGiveMinusPoints: boolean;
    playerId: string;
  };
  playerList!: {
    [key: string]: {
      name: string;
      score: number;
    };
  };

  localPlayerId: string | null = sessionStorage.getItem(
    SESSION_NAMES.PLAYER_ID
  );
  gmId: string = '';
  playerOptions!: { id: string; name: string; score: number }[];

  minusPont=1;

  constructor(
    private haramiauVotesService: HaramiauVotesService,
    private timerService: TimerService,

    private gameSettingsService: GameSettingsService,

    public dialogRef: MatDialogRef<CurrentWordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.currentWord = data.currentWord;
    this.playerList = data.playerList;
    this.gmId = data.gmId;
  }

  onConfirm() {
    this.selectedPlayer = true;
  }

  closeDialog() {
    this.dialogRef.close(this.selectedPlayerId);
  }

  ngOnInit() {
    this.minusPont = this.gameSettingsService.getWordMinusPoint();
    this.playerOptions = Object.entries(this.playerList).map(
      ([id, player]) => ({
        id,
        name: player.name,
        score: player.score,
      })
    );

    this.playerOptions = this.playerOptions.filter(
      (player) => player.id !== sessionStorage.getItem(SESSION_NAMES.PLAYER_ID)
    );

    this.timerService.startTimer(
      this.gameSettingsService.getShowWordTime() / 1000,
      STATE_NAMES.SHOW_WORD
    );
    setTimeout(() => {
      this.dialogRef.close(this.selectedPlayerId);
    }, this.gameSettingsService.getShowWordTime());
  }

  async voteHaramiau() {
    await this.haramiauVotesService.updateHaramiauVotes();

    this.votedHaramiau = true;
  }
}
