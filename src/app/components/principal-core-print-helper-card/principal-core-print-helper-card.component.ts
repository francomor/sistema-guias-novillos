import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewContainerRef, Output, EventEmitter, Input } from '@angular/core';

import { ElectronService } from '../../core/services/electron/electron.service';
import { DataSharedService } from '../../services/data-shared-services';

@Component({
  selector: 'app-principal-core-print-helper-card',
  templateUrl: './principal-core-print-helper-card.component.html',
  styleUrls: ['./principal-core-print-helper-card.component.scss']
})
export class PrincipalCorePrintHelperComponent implements OnInit, OnDestroy {
  @Input() datosAnimales: any; 
  @Output() htmlPlain: EventEmitter<string> = new EventEmitter<string>();
  
  datosCompradorSeleccionado = null;
  datosCompradorSubscribe;
  datosProductorSelecionado = null;
  datosProductorSubscribe;
  datosTransportistaSelecionado = null;
  datosTransportistaSubscribe;
  datosCamionSelecionado = null;
  datosCamionSubscribe;
  tengoDatosDeOtrosComponentes = false;
  datosAnimalesParseados = {
    Vacas: 0,
    Vaquillonas: 0,
    Novillos: 0,
    Novillitos: 0,
    Terneros: 0,
    Toros: 0,
    Porcinos: 0,
    Ovinos: 0,
    Equinos: 0,
  };
  

  constructor(
    private dataShareService:DataSharedService,
    private view: ViewContainerRef
  ) {}

  ngOnInit() {
    this.datosCompradorSubscribe = this.dataShareService.getDatosCompradorSelecionado().subscribe(datos => { 
      this.datosCompradorSeleccionado = datos;
    });
    this.datosProductorSubscribe = this.dataShareService.getDatosProductorSelecionado().subscribe(datos => {
        this.datosProductorSelecionado = datos;
    });
    this.datosTransportistaSubscribe = this.dataShareService.getDatosTransportistaSelecionado().subscribe(datos => {
      this.datosTransportistaSelecionado = datos;
    });
    this.datosCamionSubscribe = this.dataShareService.getDatosCamionSelecionado().subscribe(datos => {
      this.datosCamionSelecionado = datos;
    });
    console.log(this.datosAnimales);

    if (this.datosAnimales.Vacas != null) { this.datosAnimalesParseados.Vacas = this.datosAnimales.Vacas;}
    if (this.datosAnimales.Vaquillonas != null) { this.datosAnimalesParseados.Vaquillonas = this.datosAnimales.Vaquillonas;}
    if (this.datosAnimales.Novillos != null) { this.datosAnimalesParseados.Novillos = this.datosAnimales.Novillos;}
    if (this.datosAnimales.Novillitos != null) { this.datosAnimalesParseados.Novillitos = this.datosAnimales.Novillitos;}
    if (this.datosAnimales.Terneros != null) { this.datosAnimalesParseados.Terneros = this.datosAnimales.Terneros;}
    if (this.datosAnimales.Toros != null) { this.datosAnimalesParseados.Toros = this.datosAnimales.Toros;}
    if (this.datosAnimales.Equinos != null) { this.datosAnimalesParseados.Equinos = this.datosAnimales.Equinos;}
    if (this.datosAnimales.Porcinos != null) { this.datosAnimalesParseados.Porcinos = this.datosAnimales.Porcinos;}
    if (this.datosAnimales.Ovinos != null) { this.datosAnimalesParseados.Ovinos = this.datosAnimales.Ovinos;}

  }

  ngAfterViewInit() {
    setTimeout(() => this.htmlPlain.emit((this.view.element.nativeElement as HTMLElement).innerHTML));
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
