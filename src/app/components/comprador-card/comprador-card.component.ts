import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ViewChild } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';

import { ElectronService } from '../../core/services/electron/electron.service';
import { CompradorUpsertComponent } from '../comprador-upsert-card/comprador-upsert-card.component';
import { DataSharedService } from '../../services/data-shared-services'

@Component({
  selector: 'app-comprador-card',
  templateUrl: './comprador-card.component.html',
  styleUrls: ['./comprador-card.component.scss']
})
export class CompradorCardComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  control = new FormControl();
  resnpasBusqueda: string[] = [];
  filteredRENSPAS: Observable<string[]>;
  datosCompradorSelecionado = {};
  tengoDatos = false;
  renspaNoEncontrado = false;
  renspa: string = '';

  constructor(
    private electronService: ElectronService, 
    private changeDetectorRefService: ChangeDetectorRef, 
    public dialog: MatDialog,
    private dataShareService:DataSharedService
  ) {}

  ngOnInit() {
    this.cargaRenspas();

    this.filteredRENSPAS = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    
    this.ipcRespuestas();
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.resnpasBusqueda.filter(street => this._normalizeValue(street).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  cargaRenspas() {
    this.electronService.ipcRenderer.send('comprador:obtenerTodosLosRenspa');
  }

  inputSearchOnKeyEnter() {
    this.autocomplete.closePanel(); 
  }

  inputSearchOnKeyDown(textoInput) {
    const renspa = textoInput;
    if (textoInput === "") {
      this.renspa = '';
      this.datosCompradorSelecionado = {};
      this.dataShareService.setDatosCompradorSelecionado(null);
      this.tengoDatos = false;
      this.renspaNoEncontrado = false;
    }
    else {
      this.cargarDatosDelComprador(renspa);
    }
  }

  matOptionAutoCompleteOnSelectionChange(event) {
    const selectRenspa = event.source.value;
    this.cargarDatosDelComprador(selectRenspa);
  }

  cargarDatosDelComprador(renspa) {
    this.renspa = renspa;
    this.electronService.ipcRenderer.send('comprador:obtenerDatosComprador', renspa);
  }

  ipcRespuestas() {
    this.electronService.ipcRenderer.on('comprador:RespuestaObtenerTodosLosRenspa', (event, renspas) => {
      this.resnpasBusqueda = renspas;
    });

    this.electronService.ipcRenderer.on('comprador:RespuestaObtenerDatosComprador', (event, datosComprador) => {
      if (datosComprador == null) {
        this.renspaNoEncontrado = true;
        this.tengoDatos = false;
      } else {
        this.datosCompradorSelecionado = datosComprador;
        this.dataShareService.setDatosCompradorSelecionado(datosComprador);
        this.renspaNoEncontrado = false;
        this.tengoDatos = true;
      }
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });
  }

  openUpsertDialog(): void {
    let dataUpsert;
    if (Object.keys(this.datosCompradorSelecionado).length === 0) {
      dataUpsert = {
        renspa: this.renspa,
        update: false,
        datosCompradorSelecionado: {
          NombreLocalidad: '',
          NombreProvincia: '',
          IngresosBrutos: '',
          CUITPersona: '',
          CUIT: '',
          RazonSocial: '',
          Telefono: '',
          Email: '',
          NombreEstablecimiento: '',
          Partida: '',
          Repagro: ''
        }
      };
    } else {
      dataUpsert = {
        renspa: this.renspa,
        update: true,
        datosCompradorSelecionado: this.datosCompradorSelecionado
      };
    }
    const dialogRef = this.dialog.open(CompradorUpsertComponent, {
      autoFocus:true,
      data: dataUpsert
    });

    dialogRef.afterClosed().subscribe(renspa => {
      this.renspa = renspa;
      this.cargaRenspas();
      this.cargarDatosDelComprador(renspa);
    });
  }
}
