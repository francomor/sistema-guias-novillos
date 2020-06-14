import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ElectronService } from '../../core/services/electron/electron.service';
import { EliminarDialogComponent } from '../eliminar-dialog/eliminar-dialog.component';


@Component({
  selector: 'app-productor-listado-card',
  templateUrl: './productor-listado-card.component.html',
  styleUrls: ['./productor-listado-card.component.scss']
})
export class ProductorListadoCardComponent implements OnInit {
  displayedColumns: string[] = [
    'RENSPA', 'RazonSocial', 'CUITPersona', 'NombreEstablecimiento', 'Partida', 'Repagro', 
    'BoletoMarca', 'BoletoMarcaInc', 'BoletoMarcaFolio', 'VencimientoBoletoMarca',
    'BoletoSenial', 'BoletoSenialInc', 'BoletoSenialFolio', 'VencimientoBoletoSenial',
    'Telefono', 'Email', 'eliminar'
  ];
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
    this.cargarProductores();
    
    this.ipcRespuestas();
  }

  cargarProductores() {
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

    this.electronService.ipcRenderer.on('productor:RespuestaEliminarProductor', (event) => {
      this.openSnackBar("Productor eliminado con éxito", "");
      this.cargarProductores();
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

  onClickDeleteButton(element: any){
    const nombre = element.RazonSocial + " (" + element.RENSPA + ")";
    console.log(element);
    const dialogRef = this.dialog.open(EliminarDialogComponent, {
      autoFocus:true,
      data: nombre
    });

    dialogRef.afterClosed().subscribe(tengoQueEliminar => {
      if (tengoQueEliminar) {
        this.eliminarComprador(element);
      }
    });
  }

  eliminarComprador(productor: any) {
    this.electronService.ipcRenderer.send('productor:eliminarProductor', productor.idProductor);
  }
}
