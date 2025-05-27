import { Component } from '@angular/core';
import {MatDialogContent, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
@Component({
  selector: 'app-loadingdialog',
  standalone: true,
  imports: [MatDialogContent,
    MatDialogModule],
  templateUrl: './loadingdialog.component.html',
  styleUrl: './loadingdialog.component.css'
})
export class LoadingdialogComponent {
  message: string = "";

  constructor(public dialogRef: MatDialogRef<LoadingdialogComponent>) {
  }

  onLoading(message = "Várakozás..."){
    this.message = message
  }

  closeDialog(){
    this.dialogRef.close();
  }

}
