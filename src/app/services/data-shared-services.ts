import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharedService { 
    private datosCompradorSelecionado: BehaviorSubject<Object> = new BehaviorSubject(null);
    private datosProductorSelecionado: BehaviorSubject<Object> = new BehaviorSubject(null);
    private datosTransportistaSelecionado: BehaviorSubject<Object> = new BehaviorSubject(null);
    private datosCamionSelecionado: BehaviorSubject<Object> = new BehaviorSubject(null);
    private datosAnimales: BehaviorSubject<Object> = new BehaviorSubject(null);

    constructor() { }

    getDatosCompradorSelecionado(): Observable<Object> {
        return this.datosCompradorSelecionado.asObservable();
    }

    setDatosCompradorSelecionado(datos: Object) {
        this.datosCompradorSelecionado.next(datos);
    }

    getDatosProductorSelecionado(): Observable<Object> {
        return this.datosProductorSelecionado.asObservable();
    }

    setDatosProductorSelecionado(datos: Object) {
        this.datosProductorSelecionado.next(datos);
    }

    getDatosTransportistaSelecionado(): Observable<Object> {
        return this.datosTransportistaSelecionado.asObservable();
    }

    setDatosTransportistaSelecionado(datos: Object) {
        this.datosTransportistaSelecionado.next(datos);
    }

    getDatosCamionSelecionado(): Observable<Object> {
        return this.datosCamionSelecionado.asObservable();
    }

    setDatosCamionSelecionado(datos: Object) {
        this.datosCamionSelecionado.next(datos);
    }

    getDatosAnimales(): Observable<Object> {
        return this.datosAnimales.asObservable();
    }

    setDatosAnimales(datos: Object) {
        this.datosAnimales.next(datos);
    }
}