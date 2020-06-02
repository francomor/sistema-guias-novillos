import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ElectronService } from '../../core/services/electron/electron.service';

@Component({
  selector: 'app-principal-core-dialog-card',
  templateUrl: './principal-core-dialog-card.component.html',
  styleUrls: ['./principal-core-dialog-card.component.scss']
})
export class PrincipalCoreDialogComponent implements OnInit {
  kgMunicipalFormControl = new FormControl('', [
    Validators.required,
  ]);
  kgRentaFormControl = new FormControl('', [
    Validators.required,
  ]);

  datosFijos = {}

  constructor(
    public dialogRef: MatDialogRef<PrincipalCoreDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private electronService: ElectronService,
    private changeDetectorRefService: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.datosFijos = this.data.datosFijos;

    this.cargarDatosFijos();

    this.ipcRespuestas();
  }

  close(): void {
    this.dialogRef.close();
  }

  get checkFormValid() {
    if(this.kgMunicipalFormControl.valid && this.kgRentaFormControl.valid) 
    {
      return true;
    } else {
      return false;
    }
  }

  save(): void {
    this.callUpdateDatosFijos();
    this.dialogRef.close();
  }

  callUpdateDatosFijos() {
    this.electronService.ipcRenderer.send('datosFijos:actualizarDatosFijos', this.datosFijos);
  }

  cargarDatosFijos() {
    this.electronService.ipcRenderer.send('datosFijos:obtenerDatosFijos');
  }

  ipcRespuestas() {
    this.electronService.ipcRenderer.on('datosFijos:RespuestaObtenerDatosFijos', (event, datosFijos) => {
      this.datosFijos = datosFijos;
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });
  }
}
