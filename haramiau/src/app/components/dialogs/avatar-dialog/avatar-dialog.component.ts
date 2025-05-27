import { Component } from '@angular/core';
import { PlayerService } from '../../../services/player/player.service';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-avatar-dialog',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './avatar-dialog.component.html',
  styleUrl: './avatar-dialog.component.css'
})
export class AvatarDialogComponent {
  avatarImagePaths: string[] = [];

  constructor(private playerService:PlayerService, public dialogRef:MatDialogRef<AvatarDialogComponent>){}

  ngOnInit() {
   this.avatarImagePaths = Array.from({ length: 27 }, (_, i) => '/avatars/'+(i+1)+'.png');
  }

  selectAvatar(avatar:number) {
    if(avatar >= 0 && avatar <= 27) {
      console.log('kiválasztott id: '+(avatar+1));
      this.playerService.updateAvatar(avatar+1);
    }
  }

  close(){
    this.dialogRef.close();
  }
}
