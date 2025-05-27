import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoundenddialogComponent } from './roundenddialog.component';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ConfettiService } from '../../../services/confetti/confetti.service';
import { GameStatusService } from '../../../services/game-status/game-status.service';
import { RandomwordService } from '../../../services/random-word/randomword.service';
import { CurrentTurnService } from '../../../services/current-turn/current-turn.service';
import { of } from 'rxjs';

describe('RoundenddialogComponent', () => {
  let component: RoundenddialogComponent;
  let fixture: ComponentFixture<RoundenddialogComponent>;
  let confettiServiceSpy: jasmine.SpyObj<ConfettiService>;
  let gameStatusServiceSpy: jasmine.SpyObj<GameStatusService>;
  let randomWordServiceSpy: jasmine.SpyObj<RandomwordService>;
  let currentTurnServiceSpy: jasmine.SpyObj<CurrentTurnService>;

  const mockDialogRef = {
    close: jasmine.createSpy('close'),
  };

  const mockData = {
    playerDatas: {
      player1: { name: 'Player 1', score: 10 },
      player2: { name: 'Player 2', score: 15 },
    },
    gameMaster: 'player2',
  };

  beforeEach(async () => {
    confettiServiceSpy = jasmine.createSpyObj('ConfettiService', ['firework']);
    gameStatusServiceSpy = jasmine.createSpyObj('GameStatusService', [
      'setGameStatus',
    ]);
    randomWordServiceSpy = jasmine.createSpyObj('RandomwordService', [
      'createDeck',
    ]);
    currentTurnServiceSpy = jasmine.createSpyObj('CurrentTurnService', [
      'resetTurn',
    ]);

    await TestBed.configureTestingModule({
      imports: [MatDialogModule, RoundenddialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: ConfettiService, useValue: confettiServiceSpy },
        { provide: GameStatusService, useValue: gameStatusServiceSpy },
        { provide: RandomwordService, useValue: randomWordServiceSpy },
        { provide: CurrentTurnService, useValue: currentTurnServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoundenddialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call endRound method and trigger confetti firework', () => {
    component.endRound();
    expect(confettiServiceSpy.firework).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should not call nextRound method if player is not game master', async () => {
    sessionStorage.setItem('PLAYER_ID', 'player1'); // Not the game master

    await component.nextRound();

    expect(currentTurnServiceSpy.resetTurn).not.toHaveBeenCalled();
    expect(randomWordServiceSpy.createDeck).not.toHaveBeenCalled();
    expect(gameStatusServiceSpy.setGameStatus).not.toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
