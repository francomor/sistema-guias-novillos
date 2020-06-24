import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Validators, FormControl } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

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
  derechoOficinaControl = new FormControl('', [
    Validators.required
  ]);
  totalGanado = 0;

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

  bovinosVenta = null;
  ovinosVenta = null;
  porcinosVenta = null;
  equinosVenta = null;

  derechoOficinaCantidad = 1;
  datosCheckbox = {
    ingresosBrutos: false,
  }

  datosFijos = {
    KgMunicipal: '0',
    KgRenta: '0',
    ufsDerechoOficina: '0',
    ingresosBrutosVacas: '0',
    ingresosBrutosVaquillonas: '0',
    ingresosBrutosNovillos: '0',
    ingresosBrutosNovillitos: '0',
    ingresosBrutosTerneros: '0',
    ingresosBrutosToros: '0',
    ingresosBrutosPorcinos: '0',
    ingresosBrutosEquinos: '0',
    ingresosBrutosOvinos: '0',
    ufsGanadoSiMismo: '0',
    ufsGanadoVentaProvincia: '0',
    ufsGanadoVentaFaenaDentro: '0',
    ufsGanadoVentaFuera: '0',
    ufsPorcinosVentaProvincia: '0',
    ufsPorcinosVentaFuera: '0',
    ufsOvinosVentaProvincia: '0',
    ufsOvinosVentaFuera: '0',
    ufsEquinosVentaProvincia: '0',
    ufsEquinosVentaFuera: '0',
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

  navigationSubscription; 
  
  constructor(
    private electronService: ElectronService, 
    private changeDetectorRefService: ChangeDetectorRef, 
    public dialog: MatDialog,
    private dataShareService:DataSharedService,
    private _decimalPipe: DecimalPipe,
    private router: Router,
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

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.resetDatos();
      }
    });
  }
  
  resetDatos() {
    this.datosAnimales = {
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
  
    this.bovinosVenta = null;
    this.ovinosVenta = null;
    this.equinosVenta = null;
    this.porcinosVenta = null;
  
    this.derechoOficinaCantidad = 1;
    this.datosCheckbox = {
      ingresosBrutos: false,
    }

    this.readyToPrint = false;
    this.tengoDatosDeOtrosComponentes = false;
    this.htmlAImprimir = '';
    this.total = 0;
    this.totalRedondeo = '0';
    this.totalSoloGuia = 0;
    this.derechoOficina = 0;
    this.ingresosBrutos = 0;
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

  checkStateRadioBovinos(event, el) {
    event.preventDefault();
    if (this.bovinosVenta && this.bovinosVenta === el.value) {
      el.checked = false;
      this.bovinosVenta = null;
    } else {
      this.bovinosVenta = el.value
      el.checked = true;
    }
    this.calcularTotal();
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

  checkStateRadioEquinos(event, el) {
    event.preventDefault();
    if (this.equinosVenta && this.equinosVenta === el.value) {
      el.checked = false;
      this.equinosVenta = null;
    } else {
      this.equinosVenta = el.value
      el.checked = true;
    }
    this.calcularTotal();
  }

  onRedondeoChange(event){
    this.total = parseInt(this.totalRedondeo) + this.derechoOficina;
  }

  calcularTotal() {
    this.dataShareService.setDatosAnimales(this.datosAnimales);
    const kgMunicipal = parseFloat(this.datosFijos.KgMunicipal.replace(/,/g, '.'));
    const kgRenta = parseFloat(this.datosFijos.KgRenta.replace(/,/g, '.'));
    const ufsDerechoOficina = parseFloat(this.datosFijos.ufsDerechoOficina.replace(/,/g, '.'));
    const calculoDerechoOficina = ufsDerechoOficina * kgMunicipal;
    this.derechoOficina = 0;
    this.total = 0;
    this.totalSoloGuia = 0;
    this.ingresosBrutos = this.calculoIngresosBrutos(kgRenta);
    let calculoTotalRedondeo = 0;

    if (this.derechoOficinaCantidad != null){ 
      this.derechoOficina += calculoDerechoOficina * this.derechoOficinaCantidad; 
    }
    if (this.datosCheckbox.ingresosBrutos){ calculoTotalRedondeo += this.ingresosBrutos; }

    calculoTotalRedondeo += this.sumarValoresGanado(kgMunicipal);
    calculoTotalRedondeo += this.sumarValoresPorcinos(kgMunicipal);
    calculoTotalRedondeo += this.sumarValoresOvinos(kgMunicipal);  
    calculoTotalRedondeo += this.sumarValoresEquinos(kgMunicipal);  

    this.totalSoloGuia += this.sumarValoresGanado(kgMunicipal);
    this.totalSoloGuia += this.sumarValoresPorcinos(kgMunicipal);
    this.totalSoloGuia += this.sumarValoresOvinos(kgMunicipal);  
    this.totalSoloGuia += this.sumarValoresEquinos(kgMunicipal);  

    this.totalRedondeo = this._decimalPipe.transform(calculoTotalRedondeo, '1.0-2', 'es-Ar');
    this.total = calculoTotalRedondeo + this.derechoOficina;
  }

  calculoIngresosBrutos(kgRenta) {
    let ingresosBrutos = 0;
    this.datosCheckbox.ingresosBrutos = false;
    const ingresosBrutosVacas = parseFloat(this.datosFijos.ingresosBrutosVacas.replace(/,/g, '.'));
    const ingresosBrutosVaquillonas = parseFloat(this.datosFijos.ingresosBrutosVaquillonas.replace(/,/g, '.'));
    const ingresosBrutosNovillos = parseFloat(this.datosFijos.ingresosBrutosNovillos.replace(/,/g, '.'));
    const ingresosBrutosNovillitos = parseFloat(this.datosFijos.ingresosBrutosNovillitos.replace(/,/g, '.'));
    const ingresosBrutosTerneros = parseFloat(this.datosFijos.ingresosBrutosTerneros.replace(/,/g, '.'));
    const ingresosBrutosToros = parseFloat(this.datosFijos.ingresosBrutosToros.replace(/,/g, '.'));
    const ingresosBrutosPorcinos = parseFloat(this.datosFijos.ingresosBrutosPorcinos.replace(/,/g, '.'));
    const ingresosBrutosEquinos = parseFloat(this.datosFijos.ingresosBrutosEquinos.replace(/,/g, '.'));
    const ingresosBrutosOvinos = parseFloat(this.datosFijos.ingresosBrutosOvinos.replace(/,/g, '.'));

    if (this.bovinosVenta === 'VentaForanea') {
      if (this.datosAnimales.Vacas != null) { ingresosBrutos += ingresosBrutosVacas * kgRenta * this.datosAnimales.Vacas;}
      if (this.datosAnimales.Vaquillonas != null) { ingresosBrutos += ingresosBrutosVaquillonas * kgRenta * this.datosAnimales.Vaquillonas;}
      if (this.datosAnimales.Novillos != null) { ingresosBrutos += ingresosBrutosNovillos * kgRenta * this.datosAnimales.Novillos;}
      if (this.datosAnimales.Novillitos != null) { ingresosBrutos += ingresosBrutosNovillitos * kgRenta * this.datosAnimales.Novillitos;}
      if (this.datosAnimales.Terneros != null) { ingresosBrutos += ingresosBrutosTerneros * kgRenta * this.datosAnimales.Terneros;}
      if (this.datosAnimales.Toros != null) { ingresosBrutos += ingresosBrutosToros * kgRenta * this.datosAnimales.Toros;}
      this.datosCheckbox.ingresosBrutos = true;
    }

    if (this.porcinosVenta === 'VentaFuera') {
      if (this.datosAnimales.Porcinos != null) { ingresosBrutos += ingresosBrutosPorcinos * kgRenta * this.datosAnimales.Porcinos;}
      this.datosCheckbox.ingresosBrutos = true;
    }
    if (this.equinosVenta === 'VentaFuera') {
      if (this.datosAnimales.Equinos != null) { ingresosBrutos += ingresosBrutosEquinos * kgRenta * this.datosAnimales.Equinos;}
      this.datosCheckbox.ingresosBrutos = true;
    }
    if (this.ovinosVenta === 'VentaFuera') {
      if (this.datosAnimales.Ovinos != null) { ingresosBrutos += ingresosBrutosOvinos * kgRenta * this.datosAnimales.Ovinos;}
      this.datosCheckbox.ingresosBrutos = true;
    }

    return ingresosBrutos;
  }

  sumarValoresGanado(kgMunicipal) {
    let total = 0;
    const ufsGanadoSiMismo = parseFloat(this.datosFijos.ufsGanadoSiMismo.replace(/,/g, '.'));
    const ufsGanadoVentaProvincia = parseFloat(this.datosFijos.ufsGanadoVentaProvincia.replace(/,/g, '.'));
    const ufsGanadoVentaFaenaDentro = parseFloat(this.datosFijos.ufsGanadoVentaFaenaDentro.replace(/,/g, '.'));
    const ufsGanadoVentaFuera = parseFloat(this.datosFijos.ufsGanadoVentaFuera.replace(/,/g, '.'));
    
    const precioGanadoSiMismo = ufsGanadoSiMismo * kgMunicipal;
    const precioGanadoVentaProvincia = ufsGanadoVentaProvincia * kgMunicipal;
    const precioGanadoVentaFaenaDentro = ufsGanadoVentaFaenaDentro * kgMunicipal;
    const precioGanadoVentaFuera = ufsGanadoVentaFuera * kgMunicipal;

    const cantidadDeBobinos = this.calcularCantidadDeBoninos();
    if (this.bovinosVenta === 'VentaProvincia') {
      total += precioGanadoVentaProvincia * cantidadDeBobinos;
    }
    else if (this.bovinosVenta === 'VentaForanea') {
      total += precioGanadoVentaFuera * cantidadDeBobinos;
    }
    else if (this.bovinosVenta === 'MismoEjido') {
      ; // no se multiplica por nada
    }
    else if (this.bovinosVenta === 'TransladoProvincial') {
      total += precioGanadoSiMismo * cantidadDeBobinos;
    }
    else if (this.bovinosVenta === 'FaenaLocal') {
      total += precioGanadoVentaFaenaDentro * cantidadDeBobinos;
    }
    else if (this.bovinosVenta === 'Feria') {
      total += precioGanadoVentaProvincia * cantidadDeBobinos;
    }
    
    return total;
  }

  calcularCantidadDeBoninos() {
    let cantidadDeBobinos = 0;
    if (this.datosAnimales.Vacas != null) { cantidadDeBobinos += this.datosAnimales.Vacas;}
    if (this.datosAnimales.Vaquillonas != null) { cantidadDeBobinos += this.datosAnimales.Vaquillonas;}
    if (this.datosAnimales.Novillos != null) { cantidadDeBobinos += this.datosAnimales.Novillos;}
    if (this.datosAnimales.Novillitos != null) { cantidadDeBobinos += this.datosAnimales.Novillitos;}
    if (this.datosAnimales.Terneros != null) { cantidadDeBobinos += this.datosAnimales.Terneros;}
    if (this.datosAnimales.Toros != null) { cantidadDeBobinos += this.datosAnimales.Toros;}
    this.totalGanado = cantidadDeBobinos;
    return cantidadDeBobinos;
  }

  sumarValoresPorcinos(kgMunicipal) {
    let total = 0;
    const ufsPorcinosVentaProvincia = parseFloat(this.datosFijos.ufsPorcinosVentaProvincia.replace(/,/g, '.'));
    const ufsPorcinosVentaFuera = parseFloat(this.datosFijos.ufsPorcinosVentaFuera.replace(/,/g, '.'));
   
    const precioPorcinosVentaProvincia = ufsPorcinosVentaProvincia * kgMunicipal;
    const precioPorcinosVentaFuera = ufsPorcinosVentaFuera * kgMunicipal;

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
    const ufsOvinosVentaProvincia = parseFloat(this.datosFijos.ufsOvinosVentaProvincia.replace(/,/g, '.'));
    const ufsOvinosVentaFuera = parseFloat(this.datosFijos.ufsOvinosVentaFuera.replace(/,/g, '.'));

    const precioOvinosVentaProvincia = ufsOvinosVentaProvincia * kgMunicipal;
    const precioOvinosVentaFuera = ufsOvinosVentaFuera * kgMunicipal;  
    
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

  sumarValoresEquinos(kgMunicipal) {
    let total = 0;
    const ufsEquinosVentaProvincia = parseFloat(this.datosFijos.ufsEquinosVentaProvincia.replace(/,/g, '.'));
    const ufsEquinosVentaFuera = parseFloat(this.datosFijos.ufsEquinosVentaFuera.replace(/,/g, '.'));

    const precioEquinosVentaProvincia = ufsEquinosVentaProvincia * kgMunicipal;
    const precioEquinosVentaFuera = ufsEquinosVentaFuera * kgMunicipal;  
    
    const cantidadDeEquinos = this.calcularCantidadEquinos();
    if (this.equinosVenta === 'VentaProvincia') {
      total += precioEquinosVentaProvincia * cantidadDeEquinos;
    }
    else if (this.equinosVenta === 'VentaFuera') {
      total += precioEquinosVentaFuera * cantidadDeEquinos;
    }
    return total;
  }

  calcularCantidadEquinos() {
    let cantidadDeEquinos = 0;
    if (this.datosAnimales.Equinos != null) { cantidadDeEquinos += this.datosAnimales.Equinos;}
    return cantidadDeEquinos;
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

    this.electronService.ipcRenderer.on('print:Printed', (event) => {
      // refresh view
      this.readyToPrint = false;
      this.htmlAImprimir = '';
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
    location.reload();
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
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
}
