import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingdialogComponent } from './loadingdialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('LoadingdialogComponent', () => {
  let component: LoadingdialogComponent;
  let fixture: ComponentFixture<LoadingdialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<LoadingdialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [MatDialogModule, LoadingdialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default message', () => {
    expect(component.message).toBe("");
  });

  describe('onLoading()', () => {
    it('should set custom message', () => {
      component.onLoading("Custom loading message");
      expect(component.message).toBe("Custom loading message");
    });

    it('should use default message when no parameter', () => {
      component.onLoading();
      expect(component.message).toBe("Várakozás...");
    });
  });

  describe('closeDialog()', () => {
    it('should close the dialog', () => {
      component.closeDialog();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
