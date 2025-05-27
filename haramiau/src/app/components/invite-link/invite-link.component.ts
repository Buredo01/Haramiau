import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-invite-link',
  templateUrl: './invite-link.component.html',
  styleUrls: ['./invite-link.component.css'],
  standalone: true,
  imports: [MatIconModule],
})
export class InviteLinkComponent {
  baseUrl: string = '';
  @Input() roomName: string = '';

  @Output() link = new EventEmitter<string>();

  ngOnInit(): void {
    // Dinamikusan beállítjuk az alap URL-t
    const hostname = window.location.hostname;
    this.baseUrl =
      hostname === 'localhost'
        ? 'http://localhost:4200/'
        : 'https://proj.balazs-t.hu/';

    this.link.emit(this.inviteLink);
  }

  get inviteLink(): string {
    return `${this.baseUrl}?room=${encodeURIComponent(this.roomName)}`;
  }

  copyInviteLink(event: Event) {
    event.preventDefault();
    if (this.inviteLink) {
      navigator.clipboard
        .writeText(this.inviteLink)
        .then(() => {
          alert('A link másolva lett a vágólapra!');
        })
        .catch((err) => {
          console.error('Hiba a másolásnál:', err);
        });
    } else {
      alert('Hiba történt, nem lehet másolni');
    }
  }
}
