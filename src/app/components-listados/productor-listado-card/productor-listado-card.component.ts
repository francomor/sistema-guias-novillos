import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ElectronService } from '../../core/services/electron/electron.service';


@Component({
  selector: 'app-productor-listado-card',
  templateUrl: './productor-listado-card.component.html',
  styleUrls: ['./productor-listado-card.component.scss']
})
export class ProductorListadoCardComponent implements OnInit {
  displayedColumns: string[] = ['RENSPA', 'RazonSocial', 'CUITPersona', 'NombreEstablecimiento', 'Partida', 'Repagro'];
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
    this.electronService.ipcRenderer.send('productor:obtenerTodosLosProductores');
  }

  ipcRespuestas() {
    this.electronService.ipcRenderer.on('productor:RespuestaObtenerTodosLosProductores', (event, datos) => {
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
    localStorage.setItem('ProductorRenspa', JSON.stringify(event.target.innerHTML.trim()));
    this.openSnackBar("Productor con RENSPA " + event.target.innerHTML + " fue seleccionado con éxito", "");
  }

  openSnackBar(message: string, action: string) {
    this.zone.run(() => {
      this._snackBar.open(message, action, {
        duration: 2000,
      });
    });
  }
}
