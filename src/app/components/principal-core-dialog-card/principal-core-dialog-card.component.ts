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
  ufsDerechoOficinaFormControl = new FormControl('', [
    Validators.required,
  ]);
  ingresosBrutosVacasFormControl = new FormControl('', [
    Validators.required,
  ]);
  ingresosBrutosVaquillonasFormControl = new FormControl('', [
    Validators.required,
  ]);
  ingresosBrutosNovillosFormControl = new FormControl('', [
    Validators.required,
  ]);
  ingresosBrutosNovillitosFormControl = new FormControl('', [
    Validators.required,
  ]);
  ingresosBrutosTernerosFormControl = new FormControl('', [
    Validators.required,
  ]);
  ingresosBrutosTorosFormControl = new FormControl('', [
    Validators.required,
  ]);
  ingresosBrutosPorcinosFormControl = new FormControl('', [
    Validators.required,
  ]);
  ingresosBrutosEquinosFormControl = new FormControl('', [
    Validators.required,
  ]);
  ingresosBrutosOvinosFormControl = new FormControl('', [
    Validators.required,
  ]);
  ufsGanadoSiMismoFormControl = new FormControl('', [
    Validators.required,
  ]);
  ufsGanadoVentaProvinciaFormControl = new FormControl('', [
    Validators.required,
  ]);
  ufsGanadoVentaFaenaDentroFormControl = new FormControl('', [
    Validators.required,
  ]);
  ufsGanadoVentaFueraFormControl = new FormControl('', [
    Validators.required,
  ]);
  ufsPorcinosVentaProvinciaFormControl = new FormControl('', [
    Validators.required,
  ]);
  ufsPorcinosVentaFueraFormControl = new FormControl('', [
    Validators.required,
  ]);
  ufsOvinosVentaProvinciaFormControl = new FormControl('', [
    Validators.required,
  ]);
  ufsOvinosVentaFueraFormControl = new FormControl('', [
    Validators.required,
  ]);
  ufsEquinosVentaProvinciaFormControl = new FormControl('', [
    Validators.required,
  ]);
  ufsEquinosVentaFueraFormControl = new FormControl('', [
    Validators.required,
  ]);

  datosFijos = {
    KgMunicipal: undefined,
    KgRenta: undefined,
    ufsDerechoOficina: undefined,
    ingresosBrutosVacas: undefined,
    ingresosBrutosVaquillonas: undefined,
    ingresosBrutosNovillos: undefined,
    ingresosBrutosNovillitos: undefined,
    ingresosBrutosTerneros: undefined,
    ingresosBrutosToros: undefined,
    ingresosBrutosPorcinos: undefined,
    ingresosBrutosEquinos: undefined,
    ingresosBrutosOvinos: undefined,
    ufsGanadoSiMismo: undefined,
    ufsGanadoVentaProvincia: undefined,
    ufsGanadoVentaFaenaDentro: undefined,
    ufsGanadoVentaFuera: undefined,
    ufsPorcinosVentaProvincia: undefined,
    ufsPorcinosVentaFuera: undefined,
    ufsOvinosVentaProvincia: undefined,
    ufsOvinosVentaFuera: undefined,
    ufsEquinosVentaProvincia: undefined,
    ufsEquinosVentaFuera: undefined,
  }

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
    if(this.kgMunicipalFormControl.valid && 
      this.kgRentaFormControl.valid && 
      this.ufsDerechoOficinaFormControl.valid && 
      this.ingresosBrutosVacasFormControl.valid && 
      this.ingresosBrutosVaquillonasFormControl.valid && 
      this.ingresosBrutosNovillosFormControl.valid && 
      this.ingresosBrutosNovillitosFormControl.valid && 
      this.ingresosBrutosTernerosFormControl.valid && 
      this.ingresosBrutosTorosFormControl.valid && 
      this.ingresosBrutosPorcinosFormControl.valid && 
      this.ingresosBrutosEquinosFormControl.valid && 
      this.ingresosBrutosOvinosFormControl.valid && 
      this.ufsGanadoSiMismoFormControl.valid && 
      this.ufsGanadoVentaProvinciaFormControl.valid && 
      this.ufsGanadoVentaFaenaDentroFormControl.valid && 
      this.ufsGanadoVentaFueraFormControl.valid && 
      this.ufsPorcinosVentaProvinciaFormControl.valid && 
      this.ufsPorcinosVentaFueraFormControl.valid && 
      this.ufsOvinosVentaProvinciaFormControl.valid && 
      this.ufsOvinosVentaFueraFormControl.valid && 
      this.ufsEquinosVentaProvinciaFormControl.valid && 
      this.ufsEquinosVentaFueraFormControl.valid
      ) 
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
    this.datosFijos.KgMunicipal = this.datosFijos.KgMunicipal.replace(/\./g, ',');
    this.datosFijos.ufsDerechoOficina = this.datosFijos.ufsDerechoOficina.replace(/\./g, ',');
    this.datosFijos.ingresosBrutosVacas = this.datosFijos.ingresosBrutosVacas.replace(/\./g, ',');
    this.datosFijos.ingresosBrutosVaquillonas = this.datosFijos.ingresosBrutosVaquillonas.replace(/\./g, ',');
    this.datosFijos.ingresosBrutosNovillos = this.datosFijos.ingresosBrutosNovillos.replace(/\./g, ',');
    this.datosFijos.ingresosBrutosNovillitos = this.datosFijos.ingresosBrutosNovillitos.replace(/\./g, ',');
    this.datosFijos.ingresosBrutosTerneros = this.datosFijos.ingresosBrutosTerneros.replace(/\./g, ',');
    this.datosFijos.ingresosBrutosToros = this.datosFijos.ingresosBrutosToros.replace(/\./g, ',');
    this.datosFijos.ingresosBrutosPorcinos = this.datosFijos.ingresosBrutosPorcinos.replace(/\./g, ',');
    this.datosFijos.ingresosBrutosEquinos = this.datosFijos.ingresosBrutosEquinos.replace(/\./g, ',');
    this.datosFijos.ingresosBrutosOvinos = this.datosFijos.ingresosBrutosOvinos.replace(/\./g, ',');
    this.datosFijos.ufsGanadoSiMismo = this.datosFijos.ufsGanadoSiMismo.replace(/\./g, ',');
    this.datosFijos.ufsGanadoVentaProvincia = this.datosFijos.ufsGanadoVentaProvincia.replace(/\./g, ',');
    this.datosFijos.ufsGanadoVentaFaenaDentro = this.datosFijos.ufsGanadoVentaFaenaDentro.replace(/\./g, ',');
    this.datosFijos.ufsGanadoVentaFuera = this.datosFijos.ufsGanadoVentaFuera.replace(/\./g, ',');
    this.datosFijos.ufsPorcinosVentaProvincia = this.datosFijos.ufsPorcinosVentaProvincia.replace(/\./g, ',');
    this.datosFijos.ufsPorcinosVentaFuera = this.datosFijos.ufsPorcinosVentaFuera.replace(/\./g, ',');
    this.datosFijos.ufsOvinosVentaProvincia = this.datosFijos.ufsOvinosVentaProvincia.replace(/\./g, ',');
    this.datosFijos.ufsOvinosVentaFuera = this.datosFijos.ufsOvinosVentaFuera.replace(/\./g, ',');
    this.datosFijos.ufsEquinosVentaProvincia = this.datosFijos.ufsEquinosVentaProvincia.replace(/\./g, ',');
    this.datosFijos.ufsEquinosVentaFuera = this.datosFijos.ufsEquinosVentaFuera.replace(/\./g, ',');

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
