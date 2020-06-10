import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ViewChild } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';

import { ElectronService } from '../../core/services/electron/electron.service';
import { CompradorUpsertComponent } from '../comprador-upsert-card/comprador-upsert-card.component';
import { DataSharedService } from '../../services/data-shared-services'

@Component({
  selector: 'app-comprador-card',
  templateUrl: './comprador-card.component.html',
  styleUrls: ['./comprador-card.component.scss']
})
export class CompradorCardComponent implements OnInit, OnDestroy {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  control = new FormControl();
  cuitControl = new FormControl();
  resnpasBusqueda: string[] = [];
  filteredRENSPAS: Observable<string[]>;
  cuitBusqueda: string[] = [];
  filteredCuits: Observable<string[]>;

  datosCompradorSelecionado = {};
  tengoDatos = false;
  renspaNoEncontrado = false;
  cuitNoEncontrado = false;
  renspa: string = '';
  cuit: string = '';

  navigationSubscription;
  
  buscarPorCuit = false;
  renspasPorCuit = [];
  buscarPorRENSPA = true;
  
  constructor(
    private electronService: ElectronService, 
    private changeDetectorRefService: ChangeDetectorRef, 
    public dialog: MatDialog,
    private dataShareService:DataSharedService,
    private router: Router,
  ) {}

  ngOnInit() {
    const localRenspa = JSON.parse(localStorage.getItem('CompradorRenspa'));
    if (typeof localRenspa !== 'undefined' && localRenspa !== null){
      this.renspa = localRenspa;
    }
    this.cargaRenspas();
    this.cargaCuits();

    this.filteredRENSPAS = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.filteredCuits = this.cuitControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCuit(value))
    );
    
    this.ipcRespuestas();

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.resetDatos();
      }
    });
    // refresh view
    this.changeDetectorRefService.detectChanges();
  }

  resetDatos() {
    this.datosCompradorSelecionado = {};
    localStorage.removeItem('CompradorRenspa');
    this.tengoDatos = false;
    this.renspaNoEncontrado = false;
    this.cuitNoEncontrado = false;
    this.renspa = '';
    this.cuit = '';
    this.dataShareService.setDatosCompradorSelecionado(null);
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.resnpasBusqueda.filter(street => this._normalizeValue(street).includes(filterValue));
  }

  private _filterCuit(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.cuitBusqueda.filter(street => this._normalizeValue(street).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  cargaRenspas() {
    this.electronService.ipcRenderer.send('comprador:obtenerTodosLosRenspa');
  }

  cargaCuits() {
    this.electronService.ipcRenderer.send('comprador:obtenerTodosLosCUIT');
  }

  activaBuscaPorCuit(){
    this.buscarPorCuit = true;
    this.buscarPorRENSPA = false;
    this.resetDatos();
    // refresh view
    this.changeDetectorRefService.detectChanges();
  }

  activaBuscaPorRenspa(){
    this.buscarPorCuit = false;
    this.buscarPorRENSPA = true;
    this.resetDatos();
    // refresh view
    this.changeDetectorRefService.detectChanges();
  }

  inputSearchOnKeyEnter() {
    this.autocomplete.closePanel(); 
  }

  inputSearchOnKeyDown(textoInput) {
    const renspa = textoInput;
    if (textoInput === "") {
      this.renspa = '';
      localStorage.removeItem('CompradorRenspa');
      this.datosCompradorSelecionado = {};
      this.dataShareService.setDatosCompradorSelecionado(null);
      this.tengoDatos = false;
      this.renspaNoEncontrado = false;
    }
    else {
      this.cargarDatosDelComprador(renspa);
    }
  }

  inputSearchOnKeyDownCUIT(textoInput) {
    const cuit = textoInput;
    if (textoInput === "") {
      this.cuit = '';
      localStorage.removeItem('CompradorRenspa');
      this.datosCompradorSelecionado = {};
      this.dataShareService.setDatosCompradorSelecionado(null);
      this.tengoDatos = false;
      this.cuitNoEncontrado = false;
    }
    else {
      this.cargarDatosDelCompradorCUIT(cuit);
    }
  }

  matOptionAutoCompleteOnSelectionChange(event) {
    const selectRenspa = event.source.value;
    this.cargarDatosDelComprador(selectRenspa);
  }

  matOptionAutoCompleteOnSelectionChangeCuit(event) {
    const selectCuit = event.source.value;
    this.cargarDatosDelCompradorCUIT(selectCuit);
  }

  cargarDatosDelComprador(renspa) {
    this.renspa = renspa;
    localStorage.setItem('CompradorRenspa', JSON.stringify(this.renspa));
    this.electronService.ipcRenderer.send('comprador:obtenerDatosComprador', renspa);
  }

  cargarDatosDelCompradorCUIT(cuit) {
    this.cuit = cuit;
    this.electronService.ipcRenderer.send('comprador:obtenerDatosCompradorPorCUIT', cuit);
  }

  onRenspaSelectionChange(renspa) {
    this.renspa = renspa;
    this.cargarDatosDelComprador(renspa);
    this.buscarPorCuit = false;
    this.renspasPorCuit = [];
    this.buscarPorRENSPA = true;
  }

  ipcRespuestas() {
    this.electronService.ipcRenderer.on('comprador:RespuestaObtenerTodosLosRenspa', (event, renspas) => {
      this.resnpasBusqueda = renspas;
    });

    this.electronService.ipcRenderer.on('comprador:RespuestaObtenerTodosLosCUIT', (event, cuits) => {
      this.cuitBusqueda = cuits;
    });
    
    this.electronService.ipcRenderer.on('comprador:RespuestaObtenerDatosCompradorPorCUIT', (event, renspas) => {
      if (renspas.length == 0) {
        this.renspasPorCuit = [];
        this.cuitNoEncontrado = true;
      } else {
        this.renspasPorCuit = renspas;
        this.cuitNoEncontrado = false;
      }
      // refresh view
      this.changeDetectorRefService.detectChanges();
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
          CUITPersona: '',
          CUIT: '',
          RazonSocial: '',
          NombreEstablecimiento: '',
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

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
}
