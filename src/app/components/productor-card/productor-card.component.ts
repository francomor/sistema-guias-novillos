import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ViewChild } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';

import { ElectronService } from '../../core/services/electron/electron.service';
import { ProductorsUpsertComponent } from '../productor-upsert-card/productor-upsert-card.component';
import { DataSharedService } from '../../services/data-shared-services';

@Component({
  selector: 'app-productor-card',
  templateUrl: './productor-card.component.html',
  styleUrls: ['./productor-card.component.scss']
})
export class ProductorsCardComponent implements OnInit, OnDestroy {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  control = new FormControl();
  resnpasBusqueda: string[] = [];
  filteredRENSPAS: Observable<string[]>;
  datosProductorSelecionado = {};
  tengoDatos = false;
  renspaNoEncontrado = false;
  renspa: string = '';

  navigationSubscription; 

  constructor(
    private electronService: ElectronService, 
    private changeDetectorRefService: ChangeDetectorRef, 
    public dialog: MatDialog,
    private dataShareService:DataSharedService,
    private router: Router,
  ) {}

  ngOnInit() {

    const localRenspa = JSON.parse(localStorage.getItem('ProductorRenspa'));
    if (typeof localRenspa !== 'undefined' && localRenspa !== null){
      this.renspa = localRenspa;
    }
    this.cargaRenspas();

    this.filteredRENSPAS = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    
    this.ipcRespuestas();

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.resetDatos();
      }
    });
  }

  resetDatos() {
    this.datosProductorSelecionado = {};
    this.tengoDatos = false;
    this.renspaNoEncontrado = false;
    localStorage.removeItem('ProductorRenspa');
    this.renspa = '';
    this.dataShareService.setDatosProductorSelecionado(null);
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.resnpasBusqueda.filter(street => this._normalizeValue(street).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  cargaRenspas() {
    this.electronService.ipcRenderer.send('productor:obtenerTodosLosRenspa');
  }

  inputSearchOnKeyEnter() {
    this.autocomplete.closePanel(); 
  }

  inputSearchOnKeyDown(textoInput) {
    const renspa = textoInput;
    if (textoInput === "") {
      this.renspa = '';
      localStorage.removeItem('ProductorRenspa');
      this.datosProductorSelecionado = {};
      this.dataShareService.setDatosProductorSelecionado(null);
      this.tengoDatos = false;
      this.renspaNoEncontrado = false;
    }
    else {
      this.cargarDatosDelProductor(renspa);
    }
  }

  matOptionAutoCompleteOnSelectionChange(event) {
    const selectRenspa = event.source.value;
    this.cargarDatosDelProductor(selectRenspa);
  }

  cargarDatosDelProductor(renspa) {
    this.renspa = renspa;
    localStorage.setItem('ProductorRenspa', JSON.stringify(this.renspa));
    this.electronService.ipcRenderer.send('productor:obtenerDatosProductor', renspa);
  }

  ipcRespuestas() {
    this.electronService.ipcRenderer.on('productor:RespuestaObtenerTodosLosRenspa', (event, renspas) => {
      this.resnpasBusqueda = renspas;
    });

    this.electronService.ipcRenderer.on('productor:RespuestaObtenerDatosProductor', (event, datosProductor) => {
      if (datosProductor == null) {
        this.renspaNoEncontrado = true;
        this.tengoDatos = false;
      } else {
        this.datosProductorSelecionado = datosProductor;
        this.dataShareService.setDatosProductorSelecionado(datosProductor);
        this.renspaNoEncontrado = false;
        this.tengoDatos = true;
      }
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });
  }

  openUpsertDialog(): void {
    let dataUpsert;
    if (Object.keys(this.datosProductorSelecionado).length === 0) {
      dataUpsert = {
        renspa: this.renspa,
        update: false,
        datosProductorSelecionado: {
          BoletoMarca: '',
          BoletoMarcaInc: '',
          BoletoMarcaFolio: '',
          VencimientoBoletoMarca: '',
          BoletoSenial: '',
          BoletoSenialInc: '',
          BoletoSenialFolio: '',
          VencimientoBoletoSenial: '',
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
        datosProductorSelecionado: this.datosProductorSelecionado
      };
    }
    const dialogRef = this.dialog.open(ProductorsUpsertComponent, {
      autoFocus:true,
      data: dataUpsert
    });

    dialogRef.afterClosed().subscribe(renspa => {
      this.renspa = renspa;
      this.cargaRenspas();
      this.cargarDatosDelProductor(renspa);
    });
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
}
