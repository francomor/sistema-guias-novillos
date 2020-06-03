import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ViewChild } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ElectronService } from '../../core/services/electron/electron.service';

@Component({
  selector: 'app-productor-upsert-card',
  templateUrl: './productor-upsert-card.component.html',
  styleUrls: ['./productor-upsert-card.component.scss']
})
export class ProductorsUpsertComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  emailFormControl = new FormControl('', [
    Validators.email,
  ]);
  razonSocialFormControl = new FormControl('', [
    Validators.required,
  ]);
  controlSearchRenspa = new FormControl('', [
    Validators.required,
  ]);
  nombreEstablecimientoFormControl = new FormControl('', [
    Validators.required,
  ]);
  CUITFormControl = new FormControl('', [
    Validators.required,
    Validators.min(5)
  ]);

  resnpasBusqueda: string[] = [];
  filteredRENSPAS: Observable<string[]>;
  renspa = '';

  tengoDatos = false;
  renspaNoEncontrado = false;

  datosProductorSelecionado;

  constructor(
    public dialogRef: MatDialogRef<ProductorsUpsertComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private electronService: ElectronService,
    private changeDetectorRefService: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.datosProductorSelecionado = this.data.datosProductorSelecionado;
    this.renspa = this.data.renspa;

    this.cargaRenspas();

    this.filteredRENSPAS = this.controlSearchRenspa.valueChanges.pipe(
      map(value => this._filterRENSPA(value))
    );
    
    this.ipcRespuestas();
    this.changeDetectorRefService.detectChanges();
  }

  private _filterRENSPA(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.resnpasBusqueda.filter(street => this._normalizeValue(street).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  close(): void {
    this.dialogRef.close(this.renspa);
  }

  get checkFormValid() {
    if(this.emailFormControl.valid && this.razonSocialFormControl.valid 
      && this.controlSearchRenspa.valid && this.nombreEstablecimientoFormControl.valid
      && this.CUITFormControl.valid) 
    {
      return true;
    } else {
      return false;
    }
  }

  save(): void {
    this.callUpsertProductor();
    this.dialogRef.close(this.renspa);
  }

  callUpsertProductor() {
    this.datosProductorSelecionado.RENSPA = this.renspa;
    this.electronService.ipcRenderer.send('productor:upsertProductor', this.datosProductorSelecionado);
  }

  cargaRenspas() {
    this.electronService.ipcRenderer.send('productor:obtenerTodosLosRenspa');
  }

  inputSearchOnKeyEnter() {
    this.autocomplete.closePanel(); 
  }

  inputSearchRENSPAOnKeyDown(textoInput) {
    this.renspa = textoInput;
    this.cargarDatosDelProductor(this.renspa);
  }

  RENSPAmatOptionAutoCompleteOnSelectionChange(event) {
    this.renspa = event.source.value;
    this.cargarDatosDelProductor(this.renspa);
  }

  cargarDatosDelProductor(renspa) {
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
        this.renspaNoEncontrado = false;
        this.tengoDatos = true;
      }
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });

    this.electronService.ipcRenderer.on('productor:RespuestaUpsertProductor', (event, renspa) => {
      this.renspa = renspa;
    });
  }
}
