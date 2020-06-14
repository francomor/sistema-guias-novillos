import { Component, Inject, OnInit, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-eliminar-dialog',
  templateUrl: './eliminar-dialog.component.html',
  styleUrls: ['./eliminar-dialog.component.scss']
})
export class EliminarDialogComponent implements OnInit {
  nombre;

  constructor(
    public dialogRef: MatDialogRef<EliminarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit() {
    this.nombre = this.data;
  }

  close(): void {
    this.ngZone.run(() => {
      this.dialogRef.close(false);
    });
  }

  eliminar(): void {
    this.ngZone.run(() => {
      this.dialogRef.close(true);
    });
  }

}
