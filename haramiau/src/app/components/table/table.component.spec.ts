import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { Database } from '@angular/fire/database';
import { Firestore } from '@angular/fire/firestore';
import { RandomwordService } from '../../services/random-word/randomword.service';
import { CurrentTurnService } from '../../services/current-turn/current-turn.service';
import { AppComponent } from '../../app.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  const firestoreMock = {
    collection: (path: string) => ({
      doc: (id: string) => ({
        valueChanges: () => ({}),
        set: (data: any) => Promise.resolve(),
      }),
    }),
  };

  const randomwordServiceMock = {};
  const currentTurnServiceMock = {};
  const appComponentMock = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
      providers: [
        { provide: Database, useValue: {} },
        { provide: Firestore, useValue: firestoreMock },
        { provide: RandomwordService, useValue: randomwordServiceMock },
        { provide: CurrentTurnService, useValue: currentTurnServiceMock },
        { provide: AppComponent, useValue: appComponentMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ConvertToNumber', () => {
    it('should convert valid numeric string to number', () => {
      expect(component.ConvertToNumber('5')).toBe(5);
      expect(component.ConvertToNumber('0')).toBe(0);
      expect(component.ConvertToNumber('123')).toBe(123);
    });

    it('should return 0 for null input', () => {
      expect(component.ConvertToNumber(null)).toBe(0);
    });

    it('should return 0 for empty string', () => {
      expect(component.ConvertToNumber('')).toBe(0);
    });

    it('should return NaN for non-numeric string', () => {
      expect(component.ConvertToNumber('abc')).toBeNaN();
      expect(component.ConvertToNumber('123abc')).toBeNaN();
    });

    it('should handle decimal numbers', () => {
      expect(component.ConvertToNumber('3.14')).toBe(3.14);
      expect(component.ConvertToNumber('0.5')).toBe(0.5);
    });

    it('should handle negative numbers', () => {
      expect(component.ConvertToNumber('-10')).toBe(-10);
      expect(component.ConvertToNumber('-3.14')).toBe(-3.14);
    });
  });
  describe('isChairGM', () => {
    beforeEach(() => {
      spyOn(component, 'getCurrentGMId').and.returnValue('gmPlayer123');
    });

    it('should return true when player at index is the GM', () => {
      component.playerDatas = {
        player1: { name: 'Jatekos1', score: 3 },
        gmPlayer123: { name: 'Jatekos3', score: 3 },
        player2: { name: 'Jatekos2', score: 4 },
      };
      expect(component.isChairGM(1)).toBeTrue();
    });

    it('should return false when player at index is not the GM', () => {
      component.playerDatas = {
        player1: { name: 'Jatekos1', score: 3 },
        player2: { name: 'Jatekos2', score: 4 },
        gmPlayer123: { name: 'Jatekos3', score: 3 },
      };
      expect(component.isChairGM(0)).toBeFalse();
    });

    it('should return false when no players exist', () => {
      component.playerDatas = {};
      expect(component.isChairGM(0)).toBeFalse();
    });

    it('should return false when index is out of bounds', () => {
      component.playerDatas = {
        player1: { name: 'Jatekos1', score: 3 },
        gmPlayer123: { name: 'Jatekos3', score: 3 },
      };
      expect(component.isChairGM(2)).toBeFalse();
      expect(component.isChairGM(-1)).toBeFalse();
    });

    it('should handle case when GM exists but not at the specified index', () => {
      component.playerDatas = {
        player1: { name: 'Jatekos1', score: 3 },
        player2: { name: 'Jatekos2', score: 4 },
        gmPlayer123: { name: 'Jatekos3', score: 3 },
      };
      expect(component.isChairGM(0)).toBeFalse();
      expect(component.isChairGM(1)).toBeFalse();
      expect(component.isChairGM(2)).toBeTrue();
    });
  });
});
