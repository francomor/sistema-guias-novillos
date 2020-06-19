import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ViewChild } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ElectronService } from '../../core/services/electron/electron.service';

@Component({
  selector: 'app-comprador-upsert-card',
  templateUrl: './comprador-upsert-card.component.html',
  styleUrls: ['./comprador-upsert-card.component.scss']
})
export class CompradorUpsertComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  razonSocialFormControl = new FormControl('', [
    Validators.required,
  ]);
  controlSearchRenspa = new FormControl('', [
    Validators.required,
  ]);
  controlSearchLocalidades = new FormControl('', [
    Validators.required,
  ]);
  ProvinciaFormControl = new FormControl('', [
    Validators.required,
  ]);
  CUITFormControl = new FormControl('', [
    Validators.required,
    Validators.min(5)
  ]);

  renspa = '';

  localidadesBusqueda: string[] = [];
  filteredLocalidades: Observable<string[]>;
  localidad = '';

  tengoDatos = false;
  renspaNoEncontrado = false;

  datosCompradorSelecionado;

  provincias = [];
  idProvinciaSeleccionada = 5;

  constructor(
    public dialogRef: MatDialogRef<CompradorUpsertComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private electronService: ElectronService,
    private changeDetectorRefService: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.datosCompradorSelecionado = this.data.datosCompradorSelecionado;
    this.renspa = this.data.renspa;
    this.localidad = this.data.datosCompradorSelecionado.NombreLocalidad;

    this.cargaProvincias();
    this.cargaLocalidades();

    this.filteredLocalidades = this.controlSearchLocalidades.valueChanges.pipe(
      map(value => this._filterLocalidades(value))
    );
    
    this.ipcRespuestas();
    this.changeDetectorRefService.detectChanges();
  }

  private _filterLocalidades(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.localidadesBusqueda.filter(localidad => this._normalizeValue(localidad).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  close(): void {
    console.log(this.renspa);
    this.dialogRef.close(this.renspa);
  }

  inputSearchOnKeyEnter() {
    this.autocomplete.closePanel(); 
  }

  get checkFormValid() {
    if(this.razonSocialFormControl.valid && this.controlSearchRenspa.valid
      && this.CUITFormControl.valid && this.controlSearchLocalidades.valid
      && this.ProvinciaFormControl.valid) 
    {
      return true;
    } else {
      return false;
    }
  }

  save(): void {
    this.callUpsertComprador();
    this.dialogRef.close(this.renspa);
  }

  callUpsertComprador() {
    this.datosCompradorSelecionado.RENSPA = this.renspa;
    this.datosCompradorSelecionado.idProvincia = this.idProvinciaSeleccionada;
    this.electronService.ipcRenderer.send('comprador:upsertComprador', this.datosCompradorSelecionado);
  }

  cargaProvincias() {
    this.electronService.ipcRenderer.send('provincias:obtenerTodasLasProvincias');
  }

  cargaLocalidades() {
    this.electronService.ipcRenderer.send('localidad:obtenerTodasLasLocalidades');
  }

  inputSearchLocalidadOnKeyDown(textoInput) {
    this.localidad = textoInput;
    this.cargarIdLocalidad(this.localidad);
  }

  LocalidadesMatOptionAutoCompleteOnSelectionChange(event) {
    this.localidad = event.source.value;
    this.cargarIdLocalidad(this.localidad);
  }

  cargarDatosDelComprador(renspa) {
    this.electronService.ipcRenderer.send('comprador:obtenerDatosComprador', renspa);
  }

  cargarIdLocalidad(nombreLocalidad) {
    this.electronService.ipcRenderer.send('localidad:obtenerIdLocalidad', nombreLocalidad);
  }

  ipcRespuestas() {
    this.electronService.ipcRenderer.on('provincias:RespuestaObtenerTodasLasProvincias', (event, provincias) => {
      this.provincias = provincias;
      if (this.datosCompradorSelecionado.NombreProvincia) {
        let provincia = this.provincias.find(o => o.NombreProvincia === this.datosCompradorSelecionado.NombreProvincia);
        this.idProvinciaSeleccionada = provincia.idProvincia;
      }
    });

    this.electronService.ipcRenderer.on('localidad:RespuestaObtenerTodasLasLocalidades', (event, localidades) => {
      this.localidadesBusqueda = localidades;
    });

    this.electronService.ipcRenderer.on('localidad:RespuestaObtenerIdLocalidad', (event, idLocalidad) => {
      this.datosCompradorSelecionado.idLocalidad = idLocalidad;
      this.datosCompradorSelecionado.NombreLocalidad = this.localidad;
    });

    this.electronService.ipcRenderer.on('comprador:RespuestaObtenerDatosComprador', (event, datosComprador) => {
      if (datosComprador == null) {
        this.renspaNoEncontrado = true;
        this.tengoDatos = false;
      } else {
        this.datosCompradorSelecionado = datosComprador;
        this.localidad = datosComprador.NombreLocalidad;
        this.renspaNoEncontrado = false;
        this.tengoDatos = true;
      }
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });

    this.electronService.ipcRenderer.on('comprador:RespuestaUpsertComprador', (event, renspa) => {
      this.renspa = renspa;
    });
  }
}
