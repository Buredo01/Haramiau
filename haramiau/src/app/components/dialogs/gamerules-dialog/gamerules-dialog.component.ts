import { Component } from '@angular/core';
import {MatDialogContent} from '@angular/material/dialog';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-gamerules-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatTabGroup,
    MatTab,
    MatTabsModule,
  ],
  templateUrl: './gamerules-dialog.component.html',
  styleUrl: './gamerules-dialog.component.css'
})
export class GamerulesDialogComponent {

}
