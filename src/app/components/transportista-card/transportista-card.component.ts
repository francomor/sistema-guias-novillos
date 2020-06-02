import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ViewChild } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';

import { ElectronService } from '../../core/services/electron/electron.service';
import { TransportistaUpsertComponent } from '../transportista-upsert-card/transportista-upsert-card.component';
import { DataSharedService } from '../../services/data-shared-services';

@Component({
  selector: 'app-transportista-card',
  templateUrl: './transportista-card.component.html',
  styleUrls: ['./transportista-card.component.scss']
})
export class TransportistaCardComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  control = new FormControl();
  cuitBusqueda: string[] = [];
  filteredCuits: Observable<string[]>;
  datosTransportistaSelecionado = {};
  
  tengoDatos = false;
  cuitNoEncontrado = false;
  tieneCamiones = false;
  cuit: string = '';

  camiones = [];
  camionSeleccionado;
  tengoCamionSeleccionado = false;

  constructor(
    private electronService: ElectronService, 
    private changeDetectorRefService: ChangeDetectorRef, 
    public dialog: MatDialog,
    private dataShareService:DataSharedService
  ) {}

  ngOnInit() {
    this.cargaCuits();

    this.filteredCuits = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    
    this.ipcRespuestas();
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.cuitBusqueda.filter(street => this._normalizeValue(street).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  cargaCuits() {
    this.electronService.ipcRenderer.send('transportista:obtenerTodosLosCUIT');
  }

  inputSearchOnKeyEnter() {
    this.autocomplete.closePanel(); 
  }

  inputSearchOnKeyDown(textoInput) {
    const cuit = textoInput;
    if (textoInput === "") {
      this.cuit = '';
      this.datosTransportistaSelecionado = {};
      this.dataShareService.setDatosTransportistaSelecionado(null);
      this.dataShareService.setDatosCamionSelecionado(null);
      this.tengoDatos = false;
      this.cuitNoEncontrado = false;
    }
    else {
      this.cargarDatosDelTransportista(cuit);
    }
  }

  matOptionAutoCompleteOnSelectionChange(event) {
    const selectCuit = event.source.value;
    this.cargarDatosDelTransportista(selectCuit);
  }

  cargarDatosDelTransportista(cuit) {
    this.tengoCamionSeleccionado = false;
    this.cuit = cuit;
    this.electronService.ipcRenderer.send('camion:obtenerCamionesDelTransportista', cuit);
    this.electronService.ipcRenderer.send('transportista:obtenerDatosDelTransportista', cuit);
  }

  onCamionSelectionChange(camion) {
    this.camionSeleccionado = camion;
    this.dataShareService.setDatosCamionSelecionado(this.camionSeleccionado);
    this.tengoCamionSeleccionado = true;
    // refresh view
    this.changeDetectorRefService.detectChanges();
  }

  ipcRespuestas() {
    this.electronService.ipcRenderer.on('transportista:RespuestaObtenerTodosLosCUIT', (event, cuits) => {
      this.cuitBusqueda = cuits;
    });

    this.electronService.ipcRenderer.on('transportista:RespuestaObtenerDatosDelTransportista', (event, datosTransportista) => {
      if (datosTransportista == null) {
        this.cuitNoEncontrado = true;
        this.tengoDatos = false;
      } else {
        this.datosTransportistaSelecionado = datosTransportista;
        this.dataShareService.setDatosTransportistaSelecionado(datosTransportista);
        this.cuitNoEncontrado = false;
        this.tengoDatos = true;
      }
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });

    this.electronService.ipcRenderer.on('camion:RespuestaObtenerCamionesDelTransportista', (event, camiones) => {
      if (camiones.length == 0) {
        this.camiones = [];
        this.tieneCamiones = false;
      } else {
        this.camiones = camiones;
        this.tieneCamiones = true;
      }
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });
  }

  openUpsertDialog(): void {
    let dataUpsert;
    if (Object.keys(this.datosTransportistaSelecionado).length === 0) {
      dataUpsert = {
        cuit: this.cuit,
        update: false,
        datosTransportistaSelecionado: {
          RazonSocial: '',
          IngresosBrutos: '',
          Telefono: '',
          Email: '',
        },
        camionSeleccionado: {
          ChapaChasis: '',
          ChapaAcoplado: '',
          Chofer: '',
        }
      };
    } else {
      dataUpsert = {
        cuit: this.cuit,
        update: true,
        datosTransportistaSelecionado: this.datosTransportistaSelecionado,
        camionSeleccionado: this.camionSeleccionado,
      };
    }
    const dialogRef = this.dialog.open(TransportistaUpsertComponent, {
      autoFocus:true,
      data: dataUpsert
    });

    dialogRef.afterClosed().subscribe(cuit => {
      this.cuit = cuit;
      this.cargaCuits();
      this.cargarDatosDelTransportista(this.cuit);
    });
  }
}
