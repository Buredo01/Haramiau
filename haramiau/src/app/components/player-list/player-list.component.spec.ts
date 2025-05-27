import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerListComponent } from './player-list.component';

import { Database } from '@angular/fire/database';
import { Firestore } from '@angular/fire/firestore';

import { RealtimeTestService } from '../../services/realtime-test/realtime-test.service';
import { GameStatusService } from '../../services/game-status/game-status.service';
import { PlayerService } from '../../services/player/player.service';
import { CurrentWordService } from '../../services/current-word/current-word.service';
import { TippService } from '../../services/tipp/tipp.service';
import { RandomwordService } from '../../services/random-word/randomword.service';
import { CurrentTurnService } from '../../services/current-turn/current-turn.service';
import { EnddialogService } from '../../services/end-dialog/enddialog.service';
import { HintService } from '../../services/hint/hint.service';
import { GameMasterService } from '../../services/game-master/game-master.service';
import { HaramiauVotesService } from '../../services/haramiau-votes/haramiau-votes.service';
import { HaramiauPlayerService } from '../../services/haramiau-player/haramiau-player.service';
import { TimerService } from '../../services/timer/timer.service';

// Mock serviceek
class MockRealtimeTestService {
  currentGM = '';
  isGM() {
    return false;
  }
}
class MockGameStatusService {}
class MockPlayerService {}
class MockCurrentWordService {}
class MockTippService {}
class MockRandomwordService {}
class MockCurrentTurnService {}
class MockEnddialogService {}
class MockHintService {}
class MockGameMasterService {}
class MockHaramiauVotesService {}
class MockHaramiauPlayerService {}
class MockTimerService {
  gmSwitch$ = { subscribe: () => ({ unsubscribe: () => {} }) };
}

describe('PlayerListComponent', () => {
  let component: PlayerListComponent;
  let fixture: ComponentFixture<PlayerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerListComponent],
      providers: [
        { provide: Database, useValue: {} },
        { provide: Firestore, useValue: {} },

        { provide: RealtimeTestService, useClass: MockRealtimeTestService },
        { provide: GameStatusService, useClass: MockGameStatusService },
        { provide: PlayerService, useClass: MockPlayerService },
        { provide: CurrentWordService, useClass: MockCurrentWordService },
        { provide: TippService, useClass: MockTippService },
        { provide: RandomwordService, useClass: MockRandomwordService },
        { provide: CurrentTurnService, useClass: MockCurrentTurnService },
        { provide: EnddialogService, useClass: MockEnddialogService },
        { provide: HintService, useClass: MockHintService },
        { provide: GameMasterService, useClass: MockGameMasterService },
        { provide: HaramiauVotesService, useClass: MockHaramiauVotesService },
        { provide: HaramiauPlayerService, useClass: MockHaramiauPlayerService },
        { provide: TimerService, useClass: MockTimerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should return correct avatar path for a given index', () => {
    expect(component.getAvatarByIndex(0)).toBe('/avatars/01.png');
    expect(component.getAvatarByIndex(11)).toBe('/avatars/12.png');
    expect(component.getAvatarByIndex(12)).toBe('/avatars/01.png');
  });
});
