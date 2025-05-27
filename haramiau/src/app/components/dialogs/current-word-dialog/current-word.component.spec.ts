import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentWordComponent } from './current-word.component';

describe('CurrentWordComponent', () => {
  let component: CurrentWordComponent;
  let fixture: ComponentFixture<CurrentWordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentWordComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
