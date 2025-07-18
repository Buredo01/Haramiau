import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarDialogComponent } from './avatar-dialog.component';

describe('AvatarDialogComponent', () => {
  let component: AvatarDialogComponent;
  let fixture: ComponentFixture<AvatarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvatarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
