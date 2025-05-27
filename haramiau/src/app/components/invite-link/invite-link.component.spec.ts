import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InviteLinkComponent } from './invite-link.component';

describe('InviteLinkComponent', () => {
  let component: InviteLinkComponent;
  let fixture: ComponentFixture<InviteLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteLinkComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InviteLinkComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should return correct invite link', () => {
    component.baseUrl = 'http://localhost:4200/';
    component.roomName = 'test room';
    expect(component.inviteLink).toBe('http://localhost:4200/?room=test%20room');
  });

  it('should call clipboard.writeText when copying link', async () => {
    const writeTextSpy = jasmine.createSpy().and.returnValue(Promise.resolve());
    spyOn(navigator.clipboard, 'writeText').and.callFake(writeTextSpy);
    spyOn(window, 'alert');

    component.baseUrl = 'http://localhost:4200/';
    component.roomName = 'test';
    const fakeEvent = new MouseEvent('click');
    component.copyInviteLink(fakeEvent);

    // flush async
    await fixture.whenStable();

    expect(writeTextSpy).toHaveBeenCalledWith('http://localhost:4200/?room=test');
    expect(window.alert).toHaveBeenCalledWith('A link másolva lett a vágólapra!');
  });

});
