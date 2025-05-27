import { Component, Inject, OnInit } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { RandomwordService } from '../../../services/random-word/randomword.service';
import {
  SESSION_NAMES,
  START_TIME,
  STATE_NAMES,
} from '../../../shared/constants';
import { TimerService } from '../../../services/timer/timer.service';
import { GameSettingsService } from '../../../services/game-settings/game-settings.service';

@Component({
  selector: 'app-worddialog',
  standalone: true,
  imports: [MatDialogContent, MatDialogModule, MatRipple],
  templateUrl: './worddialog.component.html',
  styleUrl: './worddialog.component.css',
})
export class WorddialogComponent implements OnInit {
  word1: string = 'Random1';
  word2: string = 'Random2';
  value1: number = 1;
  value2: number = 2;

  constructor(
    public dialogRef: MatDialogRef<WorddialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private wordservice: RandomwordService,
    public timerService: TimerService,
    private gameSettingsService: GameSettingsService
  ) {
    this.word1 = data?.word1 || 'Nincs szó';
    this.value1 = data?.number1 || 0;
    this.word2 = data?.word2 || 'Nincs szó';
    this.value2 = data?.number2 || 0;
  }

  selectWord(word: string, value: number) {
    const roomId = sessionStorage.getItem(SESSION_NAMES.ROOM_ID);
    if (roomId == null) {
      console.log('roomId is NULL');
    } else {
      this.timerService.startTimer(
        this.gameSettingsService.getHintTime(),
        STATE_NAMES.CHOOSEN_WORD_UPDATE
      );
      this.wordservice.saveWord(roomId, word, value);
    }
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.timerService.gmSwitch$.subscribe(() => {
      this.dialogRef.close();
    });

    this.timerService.startTimer(
      this.gameSettingsService.getChooseWordTime(),
      STATE_NAMES.CHOOSE_WORD_UPDATE
    );
  }
}
