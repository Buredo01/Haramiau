import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamerulesDialogComponent } from './gamerules-dialog.component';

describe('GamerulesDialogComponent', () => {
  let component: GamerulesDialogComponent;
  let fixture: ComponentFixture<GamerulesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamerulesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamerulesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
