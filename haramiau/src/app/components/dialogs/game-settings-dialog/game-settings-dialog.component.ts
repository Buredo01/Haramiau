import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GameSettingsService } from '../../../services/game-settings/game-settings.service';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { GameSettings } from '../../../shared/types';
import { MatIconModule } from '@angular/material/icon';
import { OwnDeckDialogComponent } from '../own-deck-dialog/own-deck-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MAX_TIME } from '../../../shared/constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-settings-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './game-settings-dialog.component.html',
  styleUrl: './game-settings-dialog.component.css',
})
export class GameSettingsDialogComponent {
  settings: GameSettings = {
    turn: 0,
    isShowTip: true,
    hintTime: 0,
    tipTime: 0,
    chooseWordTime: 0,
    showWordTime: 0,
    evaluateTipsTime: 0,
    wordMinusPoint: 0,
    haramiauiMinusPoint: 0,
    ownWords: [],
  };

  
  selectedFileName: string | null = "Nincs kiválasztott fájl!";

  constructor(
    public dialogRef: MatDialogRef<GameSettingsDialogComponent>,
    private gameSettingsService: GameSettingsService,
    private dialog: MatDialog
  ) {
    let showWordTimeCorrected = this.gameSettingsService.getShowWordTime();
    if (showWordTimeCorrected % 1000 == 0) {
      showWordTimeCorrected /= 1000;
    }

    this.settings = {
      turn: this.gameSettingsService.getTurn(),
      isShowTip: this.gameSettingsService.getIsShowTip(),
      hintTime: this.gameSettingsService.getHintTime(),
      tipTime: this.gameSettingsService.getTipTime(),
      chooseWordTime: this.gameSettingsService.getChooseWordTime(),
      showWordTime: showWordTimeCorrected,

      evaluateTipsTime: this.gameSettingsService.getEvaluateTipsTime(),
      wordMinusPoint: this.gameSettingsService.getWordMinusPoint(),
      haramiauiMinusPoint: this.gameSettingsService.getHaramiauiMinusPoint(),
      ownWords: [],
    };
  }


  async save(): Promise<void> {
    if (this.settings.turn < 1 || this.settings.turn > 5) {
      alert('A körök száma minimum 1, maximum 5!');
      return;
    }
    this.gameSettingsService.setTurn(this.settings.turn);

    this.gameSettingsService.setIsShowTip(this.settings.isShowTip);

    if (this.settings.hintTime < 1 || this.settings.hintTime > MAX_TIME) {
      alert('A segítség adás ideje minimum 1 mp, maximum 300 mp!');
      return;
    }

    this.gameSettingsService.setHintTime(this.settings.hintTime);

    if (this.settings.tipTime < 1 || this.settings.tipTime > MAX_TIME) {
      alert('A tipp adás ideje minimum 1 mp, maximum 300 mp!');
      return;
    }

    this.gameSettingsService.setTipTime(this.settings.tipTime);

    if (
      this.settings.chooseWordTime < 1 ||
      this.settings.chooseWordTime > MAX_TIME
    ) {
      alert('A szó választás ideje minimum 1 mp, maximum 300 mp!');
      return;
    }

    this.gameSettingsService.setChooseWordTime(this.settings.chooseWordTime);

    if (
      this.settings.showWordTime < 1 ||
      this.settings.showWordTime > MAX_TIME
    ) {
      alert('A kör szavának megjelenítési ideje minimum 1 mp, maximum 300 mp!');
      return;
    }

    this.gameSettingsService.setShowWordTime(this.settings.showWordTime);

    if (
      this.settings.evaluateTipsTime < 1 ||
      this.settings.evaluateTipsTime > MAX_TIME
    ) {
      alert('A tippek elbírálásának ideje minimum 1 mp, maximum 300 mp!');
      return;
    }

    this.gameSettingsService.setEvaluateTipsTime(
      this.settings.evaluateTipsTime
    );

    if (this.settings.wordMinusPoint > 0) {
      alert('Egy szó mínusz pontja maximum 0 lehet!');
      return;
    }

    this.gameSettingsService.setWordMinusPoint(this.settings.wordMinusPoint);

    if (this.settings.haramiauiMinusPoint > 0) {
      alert('A Haramiau kártya mínusz pontja maximum 0 lehet!');
      return;
    }

    this.gameSettingsService.setHaramiauiMinusPoint(
      this.settings.haramiauiMinusPoint
    );

    if (this.settings.ownWords.length > 0) {
      this.gameSettingsService.setOwnWords(this.settings.ownWords);
    }

    await this.gameSettingsService.updateSettings();
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      input.value = '';
      this.selectedFileName = "Nincs kiválasztott fájl!";
      alert('Nem választottál ki fájlt.');
      return;
    }

    const file = input.files[0];
    const text = await file.text();
    const rawLines = text.split(/\r?\n/);

    const emptyLineIndexes: number[] = [];
    const trimmedLines = rawLines.map((line, index) => {
      const trimmed = line.trim();
      if (trimmed === '') {
        emptyLineIndexes.push(index + 1); // emberbarát sorszámozás
      }
      return trimmed;
    });

    if (emptyLineIndexes.length > 0) {
      this.selectedFileName = "Sikertelen feltötés!";
      alert(
        `Üres sor(ok) találhatók a fájlban a következő sorszámokon: ${emptyLineIndexes.join(
          ', '
        )}`
      );
      input.value = '';
      return;
    }

    const lines = trimmedLines.filter((line) => line !== '');

    if (lines.length === 0) {
      input.value = '';
      this.selectedFileName = "Sikertelen feltötés!";
      alert('A fájl nem tartalmaz szavakat.');
      return;
    }

    const invalidWords: string[] = [];

    for (const word of lines) {
      if (word.includes(' ') || word.includes('\t')) {
        invalidWords.push(`"${word}" - Szóköz/tabulátor van benne`);
      } else if (word.length < 2) {
        invalidWords.push(`"${word}" - Túl rövid (min. 2 karakter)`);
      } else if (word.length > 45) {
        invalidWords.push(`"${word}" - Túl hosszú (max. 45 karakter)`);
      }
    }

    if (invalidWords.length > 0) {
      this.selectedFileName = "Sikertelen feltötés!";
      alert('Hibás szavak:\n' + invalidWords.join('\n'));
      input.value = '';
      return;
    }

    this.selectedFileName = input.files[0].name;
    this.settings.ownWords = lines;
  }

  openOwnDeckInfoDialog() {
    const dialogRef = this.dialog.open(OwnDeckDialogComponent, {
      width: '600px',
      disableClose: false,
    });
  }
}
