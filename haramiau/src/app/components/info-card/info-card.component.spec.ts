import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoCardComponent } from './info-card.component';
import { RealtimeTestService } from '../../services/realtime-test/realtime-test.service';
import { SidebarService } from '../../services/sidebar/sidebar.service';
import {
  SESSION_NAMES,
  FRONTEND_STATUS,
  GAMESTATUS,
} from '../../shared/constants';
import { of } from 'rxjs';
import { SimpleChange } from '@angular/core';

describe('InfoCardComponent', () => {
  let component: InfoCardComponent;
  let fixture: ComponentFixture<InfoCardComponent>;
  let mockRealtimeService: jasmine.SpyObj<RealtimeTestService>;
  let mockSidebarService: any;
  let sessionStorageSpy: any;

  beforeEach(async () => {
    mockRealtimeService = jasmine.createSpyObj('RealtimeTestService', ['isGM']);
    mockSidebarService = {
      sidebarOpenright$: of(false),
    };

    sessionStorageSpy = spyOn(sessionStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'setItem');

    await TestBed.configureTestingModule({
      imports: [InfoCardComponent],
      providers: [
        { provide: RealtimeTestService, useValue: mockRealtimeService },
        { provide: SidebarService, useValue: mockSidebarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update state when gameStatus is SHOWWORD', () => {
    component.gameStatus = GAMESTATUS.SHOWWORD;
    component.ngOnChanges({
      gameStatus: new SimpleChange(null, GAMESTATUS.SHOWWORD, false),
    });
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      SESSION_NAMES.FRONTEND_STATE,
      FRONTEND_STATUS.END_ROUND
    );
  });

  it('should set CHOOSE_WORD state when currentWord is empty and user is GM', () => {
    mockRealtimeService.isGM.and.returnValue(true);
    component.currentWord = '';
    component.ngOnChanges({
      currentWord: new SimpleChange(null, '', false),
      currentGM: new SimpleChange(null, 'player1', false),
    });
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      SESSION_NAMES.FRONTEND_STATE,
      FRONTEND_STATUS.CHOOSE_WORD
    );
  });

  it('should set WAIT_CHOOSE_WORD state when currentWord is empty and user is not GM', () => {
    mockRealtimeService.isGM.and.returnValue(false);
    component.currentWord = '';
    component.ngOnChanges({
      currentWord: new SimpleChange(null, '', false),
      currentGM: new SimpleChange(null, 'player2', false),
    });
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      SESSION_NAMES.FRONTEND_STATE,
      FRONTEND_STATUS.WAIT_CHOOSE_WORD
    );
  });
});
