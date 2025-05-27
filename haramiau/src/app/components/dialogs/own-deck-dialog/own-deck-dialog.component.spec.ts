import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnDeckDialogComponent } from './own-deck-dialog.component';

describe('OwnDeckDialogComponent', () => {
  let component: OwnDeckDialogComponent;
  let fixture: ComponentFixture<OwnDeckDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnDeckDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnDeckDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
