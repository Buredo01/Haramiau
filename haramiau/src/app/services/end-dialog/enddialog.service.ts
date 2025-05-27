import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RoundenddialogComponent } from '../../components/dialogs/round-end-dialog/roundenddialog.component';

@Injectable({
  providedIn: 'root',
})
export class EnddialogService {
  constructor(private dialog: MatDialog) {}

  async openEndDialog(playerDatas: any, GM: string): Promise<void> {
    const dialogRef = this.dialog.open(RoundenddialogComponent, {
      minWidth: 'fit-content',
      disableClose: true,
      data: { playerDatas: playerDatas, gameMaster: GM },
    });
  }
}
