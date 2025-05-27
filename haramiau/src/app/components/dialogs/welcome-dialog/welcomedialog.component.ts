import { Component, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RealtimeTestService } from '../../../services/realtime-test/realtime-test.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { GamerulesDialogComponent } from '../../../components/dialogs/gamerules-dialog/gamerules-dialog.component';

@Component({
  selector: 'app-welcomedialog',
  imports: [
    MatDialogContent,
    MatDialogModule,
    MatFormField,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatIcon,
  ],
  templateUrl: './welcomedialog.component.html',
  standalone: true,
  styleUrl: './welcomedialog.component.css',
})
export class WelcomedialogComponent implements OnInit {
  baseUrl: string = '';
  roomData: any;
  roomName: string = '';
  playerName: any;
  isProcessing: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<WelcomedialogComponent>,
    private route: ActivatedRoute,
    private roomService: RealtimeTestService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const hostname = window.location.hostname;
    this.baseUrl =
      hostname === 'localhost'
        ? 'http://localhost:4200/'
        : 'https://proj.balazs-t.hu/';
    this.route.queryParams.subscribe((params) => {
      if (params['room']) {
        this.roomName = decodeURIComponent(params['room']);
      }
    });
  }

  async onHost() {
    this.isProcessing = true;
    if (this.playerName && this.roomName) {
      try {
        const roomExists = await this.roomService.roomExists(this.roomName);
        if (roomExists) {
          alert('Ez a szoba már létezik!');
          this.isProcessing = false;
          return;
        }

        await this.roomService.createRoom(
          Date.now().toString(),
          this.playerName,
          this.roomName
        );
        this.dialogRef.close({
          action: 'create',
          roomName: this.roomName,
          playerName: this.playerName,
        });
      } catch (error) {
        alert(
          'Hiba a szoba készítésénél:' +
            (error instanceof Error ? error.message : error)
        );
      }
    } else {
      console.log('A név kitöltése kötelező!');
    }
    this.isProcessing = false;
  }

  async onJoin() {
    this.isProcessing = true;
    if (this.playerName && this.roomName) {
      try {
        const roomExists = await this.roomService.roomExists(this.roomName);
        if (!roomExists) {
          alert('A szoba nem létezik!');
          this.isProcessing = false;
          return;
        }

        await this.roomService.joinRoom(Date.now().toString(), this.playerName);
        this.dialogRef.close({
          action: 'join',
          roomName: this.roomName,
          playerName: this.playerName,
        });
      } catch (error) {
        alert(
          'Hiba a csatlakozásnál: ' +
            (error instanceof Error ? error.message : error)
        );
      }
    } else {
      console.log('A név kitöltése kötelező!');
    }
     this.isProcessing = false;
  }

  openGRDialog() {
    const dialogRef = this.dialog.open(GamerulesDialogComponent, {
      width: '600px',
      disableClose: false,
    });
  }
}
