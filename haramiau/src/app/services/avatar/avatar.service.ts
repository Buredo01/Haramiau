import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AvatarDialogComponent } from '../../components/dialogs/avatar-dialog/avatar-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor(private dialog: MatDialog) {}

   openDialog() {
      this.dialog.open(AvatarDialogComponent, {
        width: '800px',
      });
    }
}
