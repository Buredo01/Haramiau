import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorddialogComponent } from './worddialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RandomwordService } from '../../../services/random-word/randomword.service';
import { TimerService } from '../../../services/timer/timer.service';
import { of } from 'rxjs';
import {
  SESSION_NAMES,
  START_TIME,
  STATE_NAMES,
} from '../../../shared/constants';

describe('WorddialogComponent', () => {
  let component: WorddialogComponent;
  let fixture: ComponentFixture<WorddialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<WorddialogComponent>>;
  let mockWordService: jasmine.SpyObj<RandomwordService>;
  let mockTimerService: jasmine.SpyObj<TimerService>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockWordService = jasmine.createSpyObj('RandomwordService', ['saveWord']);
    mockTimerService = jasmine.createSpyObj('TimerService', ['startTimer'], {
      gmSwitch$: of(),
    });

    await TestBed.configureTestingModule({
      imports: [WorddialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: RandomwordService, useValue: mockWordService },
        { provide: TimerService, useValue: mockTimerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorddialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call saveWord and close dialog when selectWord is called with valid roomId', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('testRoomId');
    const word = 'apple';
    const value = 42;

    component.selectWord(word, value);

    expect(mockTimerService.startTimer).toHaveBeenCalledWith(
      START_TIME,
      STATE_NAMES.CHOOSEN_WORD_UPDATE
    );
    expect(mockWordService.saveWord).toHaveBeenCalledWith(
      'testRoomId',
      word,
      value
    );
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should not call saveWord if roomId is null', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    const word = 'banana';
    const value = 10;

    component.selectWord(word, value);

    expect(mockWordService.saveWord).not.toHaveBeenCalled();
    expect(mockTimerService.startTimer).not.toHaveBeenCalledWith(
      START_TIME,
      STATE_NAMES.CHOOSEN_WORD_UPDATE
    );
    expect(mockDialogRef.close).toHaveBeenCalled(); // still closes
  });
});
