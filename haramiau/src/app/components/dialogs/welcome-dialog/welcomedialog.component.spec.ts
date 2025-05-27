import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { WelcomedialogComponent } from './welcomedialog.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RealtimeTestService } from '../../../services/realtime-test/realtime-test.service';
import { of } from 'rxjs';

describe('WelcomedialogComponent', () => {
  let component: WelcomedialogComponent;
  let fixture: ComponentFixture<WelcomedialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<WelcomedialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [WelcomedialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatDialog, useValue: { open: jasmine.createSpy() } },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ room: 'tesztszoba' }),
          },
        },
        {
          provide: RealtimeTestService,
          useValue: {
            roomExists: () => Promise.resolve(false),
            createRoom: () => Promise.resolve(),
            joinRoom: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomedialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set roomName from queryParams', () => {
    expect(component.roomName).toBe('tesztszoba');
  });

  it('should call onHost without errors', async () => {
    await expectAsync(component.onHost()).toBeResolved();
  });

  it('should call onJoin without errors', async () => {
    await expectAsync(component.onJoin()).toBeResolved();
  });
});
