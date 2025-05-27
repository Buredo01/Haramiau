import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSettingsDialogComponent } from './game-settings-dialog.component';
import { GameSettingsService } from '../../../services/game-settings/game-settings.service';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('GameSettingsDialogComponent', () => {
  let component: GameSettingsDialogComponent;
  let fixture: ComponentFixture<GameSettingsDialogComponent>;
  let mockGameSettingsService: jasmine.SpyObj<GameSettingsService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<GameSettingsDialogComponent>>;

  beforeEach(async () => {
    mockGameSettingsService = jasmine.createSpyObj('GameSettingsService', [
      'getTurn',
      'getIsShowTip',
      'getHintTime',
      'getTipTime',
      'getChooseWordTime',
      'getShowWordTime',
      'getEvaluateTipsTime',
      'getWordMinusPoint',
      'getHaramiauiMinusPoint',
      'setTurn',
      'setIsShowTip',
      'setHintTime',
      'setTipTime',
      'setChooseWordTime',
      'setShowWordTime',
      'setEvaluateTipsTime',
      'setWordMinusPoint',
      'setHaramiauiMinusPoint',
      'updateSettings',
    ]);

    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    mockGameSettingsService.getTurn.and.returnValue(3);
    mockGameSettingsService.getIsShowTip.and.returnValue(true);
    mockGameSettingsService.getHintTime.and.returnValue(5);
    mockGameSettingsService.getTipTime.and.returnValue(5);
    mockGameSettingsService.getChooseWordTime.and.returnValue(5);
    mockGameSettingsService.getShowWordTime.and.returnValue(5000);
    mockGameSettingsService.getEvaluateTipsTime.and.returnValue(5);
    mockGameSettingsService.getWordMinusPoint.and.returnValue(0);
    mockGameSettingsService.getHaramiauiMinusPoint.and.returnValue(0);
    mockGameSettingsService.updateSettings.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [GameSettingsDialogComponent],
      providers: [
        { provide: GameSettingsService, useValue: mockGameSettingsService },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog on cancel', () => {
    component.cancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should save settings if valid and close dialog', async () => {
    component.settings = {
      turn: 3,
      isShowTip: true,
      hintTime: 5,
      tipTime: 5,
      chooseWordTime: 5,
      showWordTime: 5,
      evaluateTipsTime: 5,
      wordMinusPoint: 0,
      haramiauiMinusPoint: 0,
      ownWords: [],
    };

    await component.save();

    expect(mockGameSettingsService.setTurn).toHaveBeenCalledWith(3);
    expect(mockGameSettingsService.setIsShowTip).toHaveBeenCalledWith(true);
    expect(mockGameSettingsService.setHintTime).toHaveBeenCalledWith(5);
    expect(mockGameSettingsService.setTipTime).toHaveBeenCalledWith(5);
    expect(mockGameSettingsService.setChooseWordTime).toHaveBeenCalledWith(5);
    expect(mockGameSettingsService.setShowWordTime).toHaveBeenCalledWith(5);
    expect(mockGameSettingsService.setEvaluateTipsTime).toHaveBeenCalledWith(5);
    expect(mockGameSettingsService.setWordMinusPoint).toHaveBeenCalledWith(0);
    expect(mockGameSettingsService.setHaramiauiMinusPoint).toHaveBeenCalledWith(
      0
    );
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should alert if turn is less than 1', async () => {
    spyOn(window, 'alert');
    component.settings.turn = 0;
    await component.save();
    expect(window.alert).toHaveBeenCalledWith('A körök száma minimum 1!');
  });

  it('should alert if hintTime is less than 1', async () => {
    spyOn(window, 'alert');
    component.settings.turn = 3;
    component.settings.hintTime = 0;
    await component.save();
    expect(window.alert).toHaveBeenCalledWith(
      'A segítség adás ideje minimum 1 mp!'
    );
  });
});
