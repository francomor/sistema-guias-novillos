import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ElectronService } from '../../core/services/electron/electron.service';


@Component({
  selector: 'app-comprador-listado-card',
  templateUrl: './comprador-listado-card.component.html',
  styleUrls: ['./comprador-listado-card.component.scss']
})
export class CompradorListadoCardComponent implements OnInit {
  displayedColumns: string[] = ['RENSPA', 'RazonSocial', 'CUITPersona', 'NombreEstablecimiento', 'NombreLocalidad', 'NombreProvincia'];
  todosLosDatosTabla = [];
  datosTabla = [];
  isLoading = true;

  constructor(
    private electronService: ElectronService, 
    private changeDetectorRefService: ChangeDetectorRef, 
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private readonly zone: NgZone
  ) {}

  ngOnInit() {
    this.cargaRenspas();
    
    this.ipcRespuestas();
  }

  cargaRenspas() {
    this.electronService.ipcRenderer.send('comprador:obtenerTodosLosCompradores');
  }

  ipcRespuestas() {
    this.electronService.ipcRenderer.on('comprador:RespuestaObtenerTodosLosCompradores', (event, datos) => {
      this.todosLosDatosTabla = datos;
      this.datosTabla = datos;
      this.isLoading = false;
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datosTabla = this.todosLosDatosTabla.filter((comprador)=>{
      return comprador.RazonSocial.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0; 
    });
    // refresh view
    this.changeDetectorRefService.detectChanges();
  }

  onRenspaClick(event) {
    console.log(event.target.innerHTML);
    localStorage.setItem('CompradorRenspa', JSON.stringify(event.target.innerHTML.trim()));
    this.openSnackBar("Comprador con RENSPA " + event.target.innerHTML + " fue seleccionado con éxito", "");
  }

  openSnackBar(message: string, action: string) {
    this.zone.run(() => {
      this._snackBar.open(message, action, {
        duration: 2000,
      });
    });
  }
}