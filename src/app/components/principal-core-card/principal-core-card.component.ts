import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Validators, FormControl } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import { ElectronService } from '../../core/services/electron/electron.service';
import { PrincipalCoreDialogComponent } from '../principal-core-dialog-card/principal-core-dialog-card.component';
import { DataSharedService } from '../../services/data-shared-services';

@Component({
  selector: 'app-principal-core-card',
  templateUrl: './principal-core-card.component.html',
  styleUrls: ['./principal-core-card.component.scss']
})
export class PrincipalCoreCardComponent implements OnInit, OnDestroy{
  cantidadControl = new FormControl('', [
    Validators.min(0)
  ]);
  vacasControl = new FormControl('', [
    Validators.min(0)
  ]);
  vaquillonasControl = new FormControl('', [
    Validators.min(0)
  ]);
  novillitosControl = new FormControl('', [
    Validators.min(0)
  ]);
  novillosControl = new FormControl('', [
    Validators.min(0)
  ]);
  ternerosControl = new FormControl('', [
    Validators.min(0)
  ]);
  torosControl = new FormControl('', [
    Validators.min(0)
  ]);
  porcinosControl = new FormControl('', [
    Validators.min(0)
  ]);
  ovinosControl = new FormControl('', [
    Validators.min(0)
  ]);
  equinosControl = new FormControl('', [
    Validators.min(0)
  ]);
  redondeoControl = new FormControl('', [
    Validators.required
  ]);
  
  datosAnimales = {
    Vacas: undefined,
    Vaquillonas: undefined,
    Novillos: undefined,
    Novillitos: undefined,
    Terneros: undefined,
    Toros: undefined,
    Porcinos: undefined,
    Ovinos: undefined,
    Equinos: undefined,
  };

  ovinosVenta = null;
  porcinosVenta = null;

  datosCheckbox = {
    derechoOficina: false,
    ingresosBrutos: false,
    ganadoSiMismo: false,
    ganadoVentaProvincia: false,
    ganadoVentaFaenaDentro: false,
    ganadoVentaFuera: false,
  }

  datosFijos = {
    KgMunicipal: '0',
    KgRenta: '0',
  };

  total = 0;
  totalRedondeo = '0';
  totalSoloGuia = 0;
  derechoOficina = 0;
  ingresosBrutos = 0;

  datosCompradorSeleccionado = null;
  datosCompradorSubscribe;
  datosProductorSelecionado = null;
  datosProductorSubscribe;
  datosTransportistaSelecionado = null;
  datosTransportistaSubscribe;
  datosCamionSelecionado = null;
  datosCamionSubscribe;
  tengoDatosDeOtrosComponentes = false;

  htmlAImprimir = "";
  readyToPrint = false;

  
  constructor(
    private electronService: ElectronService, 
    private changeDetectorRefService: ChangeDetectorRef, 
    public dialog: MatDialog,
    private dataShareService:DataSharedService,
    private _decimalPipe: DecimalPipe
  ) {}

  ngOnInit() {
    this.datosCompradorSubscribe = this.dataShareService.getDatosCompradorSelecionado().subscribe(datos => { 
        this.datosCompradorSeleccionado = datos;
        this.tengoDatos();
    });
    this.datosProductorSubscribe = this.dataShareService.getDatosProductorSelecionado().subscribe(datos => {
        this.datosProductorSelecionado = datos;
        this.tengoDatos();
    });
    this.datosTransportistaSubscribe = this.dataShareService.getDatosTransportistaSelecionado().subscribe(datos => {
       this.datosTransportistaSelecionado = datos;
       this.tengoDatos();
    });
    this.datosCamionSubscribe = this.dataShareService.getDatosCamionSelecionado().subscribe(datos => {
      this.datosCamionSelecionado = datos;
      this.tengoDatos();
    });

    this.cargarDatosFijos();
    
    this.ipcRespuestas();
  }
  
  cargarDatosFijos() {
    this.electronService.ipcRenderer.send('datosFijos:obtenerDatosFijos');
  }

  tengoDatos() {
    if (this.datosCompradorSeleccionado && this.datosProductorSelecionado && this.datosTransportistaSelecionado && this.datosCamionSelecionado && 
      this.redondeoControl.valid) {
      this.tengoDatosDeOtrosComponentes = true;
    } else {
      this.tengoDatosDeOtrosComponentes = false;
    }
    // refresh view
    this.changeDetectorRefService.detectChanges();
  }

  checkStateRadioOvinos(event, el) {
    event.preventDefault();
    if (this.ovinosVenta && this.ovinosVenta === el.value) {
      el.checked = false;
      this.ovinosVenta = null;
    } else {
      this.ovinosVenta = el.value
      el.checked = true;
    }
    this.calcularTotal();
  }

  checkStateRadioPorcinos(event, el) {
    event.preventDefault();
    if (this.porcinosVenta && this.porcinosVenta === el.value) {
      el.checked = false;
      this.porcinosVenta = null;
    } else {
      this.porcinosVenta = el.value
      el.checked = true;
    }
    this.calcularTotal();
  }
  
  calcularTotal() {
    this.dataShareService.setDatosAnimales(this.datosAnimales);
    const kgMunicipal = parseFloat(this.datosFijos.KgMunicipal.replace(/,/g, '.'));
    const kgRenta = parseFloat(this.datosFijos.KgRenta.replace(/,/g, '.'));
    this.derechoOficina = 3.00 * kgMunicipal;
    this.total = 0;
    this.totalSoloGuia = 0;
    this.ingresosBrutos = this.calculoIngresosBrutos(kgRenta);

    if (this.datosCheckbox.derechoOficina){ this.total += this.derechoOficina; }
    if (this.datosCheckbox.ingresosBrutos){ this.total += this.ingresosBrutos; }

    this.total += this.sumarValoresGanadoYEquinos(kgMunicipal);
    this.total += this.sumarValoresPorcinos(kgMunicipal);
    this.total += this.sumarValoresOvinos(kgMunicipal);  

    this.totalSoloGuia += this.sumarValoresGanadoYEquinos(kgMunicipal);
    this.totalSoloGuia += this.sumarValoresPorcinos(kgMunicipal);
    this.totalSoloGuia += this.sumarValoresOvinos(kgMunicipal);  

    this.totalRedondeo = this._decimalPipe.transform(this.total, '1.0-2', 'es-Ar');
  }

  calculoIngresosBrutos(kgRenta) {
    let ingresosBrutos = 0;
    if (this.datosAnimales.Vacas != null) { ingresosBrutos += 1.40 * kgRenta * this.datosAnimales.Vacas;}
    if (this.datosAnimales.Vaquillonas != null) { ingresosBrutos += 1.60 * kgRenta * this.datosAnimales.Vaquillonas;}
    if (this.datosAnimales.Novillos != null) { ingresosBrutos += 2.00 * kgRenta * this.datosAnimales.Novillos;}
    if (this.datosAnimales.Novillitos != null) { ingresosBrutos += 1.80 * kgRenta * this.datosAnimales.Novillitos;}
    if (this.datosAnimales.Terneros != null) { ingresosBrutos += 1.60 * kgRenta * this.datosAnimales.Terneros;}
    if (this.datosAnimales.Toros != null) { ingresosBrutos += 1.80 * kgRenta * this.datosAnimales.Toros;}

    if (this.datosAnimales.Equinos != null) { ingresosBrutos += 0.70 * kgRenta * this.datosAnimales.Equinos;}

    if (this.datosAnimales.Porcinos != null) { ingresosBrutos += 0.20 * kgRenta * this.datosAnimales.Porcinos;}

    if (this.datosAnimales.Ovinos != null) { ingresosBrutos += 0.10 * kgRenta * this.datosAnimales.Ovinos;}

    return ingresosBrutos;
  }

  sumarValoresGanadoYEquinos(kgMunicipal) {
    let total = 0;
    const precioGanadoSiMismo = 0.74 * kgMunicipal;
    const precioGanadoVentaProvincia = 1.56 * kgMunicipal;
    const precioGanadoVentaFaenaDentro = 2.14 * kgMunicipal;
    const precioGanadoVentaFuera = 3.00 * kgMunicipal;

    const cantidadDeBobinosYEquinos = this.calcularCantidadDeBoninosYEquinos();
    if (this.datosCheckbox.ganadoSiMismo){ total += precioGanadoSiMismo * cantidadDeBobinosYEquinos;}
    if (this.datosCheckbox.ganadoVentaProvincia){ total += precioGanadoVentaProvincia * cantidadDeBobinosYEquinos;}
    if (this.datosCheckbox.ganadoVentaFaenaDentro){ total += precioGanadoVentaFaenaDentro * cantidadDeBobinosYEquinos;}
    if (this.datosCheckbox.ganadoVentaFuera){ total += precioGanadoVentaFuera * cantidadDeBobinosYEquinos;}
    
    return total;
  }

  calcularCantidadDeBoninosYEquinos() {
    let cantidadDeBobinosYEquinos = 0;
    if (this.datosAnimales.Vacas != null) { cantidadDeBobinosYEquinos += this.datosAnimales.Vacas;}
    if (this.datosAnimales.Vaquillonas != null) { cantidadDeBobinosYEquinos += this.datosAnimales.Vaquillonas;}
    if (this.datosAnimales.Novillos != null) { cantidadDeBobinosYEquinos += this.datosAnimales.Novillos;}
    if (this.datosAnimales.Novillitos != null) { cantidadDeBobinosYEquinos += this.datosAnimales.Novillitos;}
    if (this.datosAnimales.Terneros != null) { cantidadDeBobinosYEquinos += this.datosAnimales.Terneros;}
    if (this.datosAnimales.Toros != null) { cantidadDeBobinosYEquinos += this.datosAnimales.Toros;}
    if (this.datosAnimales.Equinos != null) { cantidadDeBobinosYEquinos += this.datosAnimales.Equinos;}
    return cantidadDeBobinosYEquinos;
  }

  sumarValoresPorcinos(kgMunicipal) {
    let total = 0;
    const precioPorcinosVentaProvincia = 0.36 * kgMunicipal;
    const precioPorcinosVentaFuera = 0.73 * kgMunicipal;

    const cantidadDePorcinos = this.calcularCantidadPorcinos();
    if (this.porcinosVenta === 'VentaProvincia') {
      total += precioPorcinosVentaProvincia * cantidadDePorcinos;
    }
    else if (this.porcinosVenta === 'VentaFuera') {
      total += precioPorcinosVentaFuera * cantidadDePorcinos;
    }
    return total;
  }

  calcularCantidadPorcinos() {
    let cantidadDePorcinos = 0;
    if (this.datosAnimales.Porcinos != null) { cantidadDePorcinos += this.datosAnimales.Porcinos;}
    return cantidadDePorcinos;
  }

  sumarValoresOvinos(kgMunicipal) {
    let total = 0;
    const precioOvinosVentaProvincia = 0.86 * kgMunicipal;
    const precioOvinosVentaFuera = 1.20 * kgMunicipal;  
    
    const cantidadDeOvinos = this.calcularCantidadOvinos();
    if (this.ovinosVenta === 'VentaProvincia') {
      total += precioOvinosVentaProvincia * cantidadDeOvinos;
    }
    else if (this.ovinosVenta === 'VentaFuera') {
      total += precioOvinosVentaFuera * cantidadDeOvinos;
    }
    return total;
  }

  calcularCantidadOvinos() {
    let cantidadDeOvinos = 0;
    if (this.datosAnimales.Ovinos != null) { cantidadDeOvinos += this.datosAnimales.Ovinos;}
    return cantidadDeOvinos;
  }

  cargaHtmlAImprimir(plainHtml) {
    this.htmlAImprimir = plainHtml;
    this.electronService.ipcRenderer.send('print', this.htmlAImprimir);
  }

  print() {
    this.readyToPrint = true;
  }

  ipcRespuestas() {
    this.electronService.ipcRenderer.on('datosFijos:RespuestaObtenerDatosFijos', (event, datosFijos) => {
      this.datosFijos = datosFijos;
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });
  }

  openUpsertDialog(): void {
    const dataUpsert = {
        update: true,
        datosFijos: this.datosFijos
    };
    const dialogRef = this.dialog.open(PrincipalCoreDialogComponent, {
      autoFocus:true,
      data: dataUpsert
    });

    dialogRef.afterClosed().subscribe( () => {
      this.cargarDatosFijos();
    });
  }

  reiniciarPantalla() {
    window.location.reload();
  }

  ngOnDestroy() {
    this.datosCompradorSubscribe.next(true);
    this.datosCompradorSubscribe.complete();
    this.datosProductorSubscribe.next(true);
    this.datosProductorSubscribe.complete();
    this.datosTransportistaSubscribe.next(true);
    this.datosTransportistaSubscribe.complete();
    this.datosCamionSubscribe.next(true);
    this.datosCamionSubscribe.complete();
  }
}
