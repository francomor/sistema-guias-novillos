import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ViewChild } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ElectronService } from '../../core/services/electron/electron.service';

@Component({
  selector: 'app-transportista-upsert-card',
  templateUrl: './transportista-upsert-card.component.html',
  styleUrls: ['./transportista-upsert-card.component.scss']
})
export class TransportistaUpsertComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  razonSocialFormControl = new FormControl('', [
    Validators.required,
  ]);
  controlSearchCuit = new FormControl('', [
    Validators.required,
    Validators.min(5)
  ]);

  cuit = '';

  tengoDatos = false;
  cuitNoEncontrado = false;
  tieneCamiones = false;
  datosTransportistaSelecionado;
  
  camiones = [];
  camionesAEliminar = [];
  camionSeleccionado;
  tengoCamionSeleccionado = false;

  constructor(
    public dialogRef: MatDialogRef<TransportistaUpsertComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private electronService: ElectronService,
    private changeDetectorRefService: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.datosTransportistaSelecionado = this.data.datosTransportistaSelecionado;
    this.camionSeleccionado = this.data.camionSeleccionado;
    this.cuit = this.data.cuit;
    this.cargarDatosDelTransportista(this.cuit);
    this.ipcRespuestas();
    this.changeDetectorRefService.detectChanges();
  }

  close(): void {
    this.dialogRef.close(this.cuit);
  }

  get checkFormValid() {
    if(this.razonSocialFormControl.valid && this.controlSearchCuit.valid) 
    {
      return true;
    } else {
      return false;
    }
  }

  save(): void {
    this.callUpsertComprador();
    this.dialogRef.close(this.cuit);
  }

  callUpsertComprador() {
    this.datosTransportistaSelecionado.cuit = this.cuit;
    this.electronService.ipcRenderer.send('camion:eliminarCamiones', this.camionesAEliminar);
    this.electronService.ipcRenderer.send('transportista:upsertTransportista', this.datosTransportistaSelecionado, this.camiones);
  }

  cargaCuits() {
    this.electronService.ipcRenderer.send('transportista:obtenerTodosLosCUIT');
  }

  cargarDatosDelTransportista(cuit) {
    this.electronService.ipcRenderer.send('camion:obtenerCamionesDelTransportista', cuit);
    this.electronService.ipcRenderer.send('transportista:obtenerDatosDelTransportista', cuit);
  }

  onCamionSelectionChange(camion) {
    this.camionSeleccionado = camion;
    this.tengoCamionSeleccionado = true;
    // refresh view
    this.changeDetectorRefService.detectChanges();
  }

  addCamion() {
    this.camiones.push({
      idCamion: -1,
      Chofer: "",
      ChapaChasis: "",
      ChapaAcoplado: "",
    });
    this.tieneCamiones = true;
    // refresh view
    this.changeDetectorRefService.detectChanges();
  }

  removeCamion() {
    if(this.tengoCamionSeleccionado) {
      this.camionesAEliminar.push(this.camionSeleccionado);
      for(var i = 0; i < this.camiones.length; i++){ 
        if (this.camiones[i] === this.camionSeleccionado) { 
          this.camiones.splice(i, 1); 
          i--; 
        }
      }
      this.tengoCamionSeleccionado = false; 
      // refresh view
      this.changeDetectorRefService.detectChanges();
    }
  }

  ipcRespuestas() {
    this.electronService.ipcRenderer.on('transportista:RespuestaObtenerDatosDelTransportista', (event, datosTransportista) => {
      if (datosTransportista == null) {
        this.cuitNoEncontrado = true;
        this.tengoDatos = false;
      } else {
        this.datosTransportistaSelecionado = datosTransportista;
        this.cuitNoEncontrado = false;
        this.tengoDatos = true;
      }
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });

    this.electronService.ipcRenderer.on('camion:RespuestaObtenerCamionesDelTransportista', (event, camiones) => {
      if (camiones.length == 0) {
        this.tieneCamiones = false;
        this.tengoCamionSeleccionado = false;
      } else {
        this.camiones = camiones;
        this.camionesAEliminar = [];
        this.tieneCamiones = true;
        this.tengoCamionSeleccionado = false;
      }
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });

    this.electronService.ipcRenderer.on('transportista:RespuestaUpsertTransportista', (event, cuit) => {
      this.cuit = cuit;
    });

    this.electronService.ipcRenderer.on('camion:RespuestaEliminarCamiones', (event) => {
      this.camionesAEliminar = [];
    });
  }
}
