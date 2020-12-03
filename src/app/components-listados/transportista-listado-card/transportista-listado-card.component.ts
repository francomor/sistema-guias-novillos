import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ElectronService } from '../../core/services/electron/electron.service';
import { EliminarDialogComponent } from '../eliminar-dialog/eliminar-dialog.component';


@Component({
  selector: 'app-transportista-listado-card',
  templateUrl: './transportista-listado-card.component.html',
  styleUrls: ['./transportista-listado-card.component.scss']
})
export class TransportistaListadoCardComponent implements OnInit {
  displayedColumns: string[] = ['CUIT', 'RazonSocial', 'ChapaChasis', 'ChapaAcoplado', 'Chofer', 'eliminar'];
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
    this.cargarTransportistas();
    
    this.ipcRespuestas();
  }

  cargarTransportistas() {
    this.electronService.ipcRenderer.send('transportista:obtenerTodosLosTransportistas');
  }

  ipcRespuestas() {
    this.electronService.ipcRenderer.on('transportista:RespuestaObtenerTodosLosTransportistas', (event, datos) => {
      this.todosLosDatosTabla = datos;
      this.datosTabla = datos;
      this.isLoading = false;
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });

    this.electronService.ipcRenderer.on('transportista:RespuestaEliminarTransportista', (event) => {
      this.openSnackBar("Transportista eliminado con éxito", "");
      this.cargarTransportistas();
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

  onCuitClick(transportista) {
    const cuitTransportista = transportista.CUIT;
    const idCamionTransportista = transportista.idCamion;
    localStorage.setItem('TransportistaCUIT', JSON.stringify(cuitTransportista));
    localStorage.setItem('TransportistaIDCamionSeleccionado', JSON.stringify(idCamionTransportista));
    this.openSnackBar("Transportista con CUIT " + cuitTransportista + " fue seleccionado con éxito", "");
  }

  openSnackBar(message: string, action: string) {
    this.zone.run(() => {
      this._snackBar.open(message, action, {
        duration: 2000,
      });
    });
  }

  onClickDeleteButton(element: any){
    const nombre = element.RazonSocial + " (" + element.ChapaChasis + " - " + element.ChapaAcoplado + ")";
    const dialogRef = this.dialog.open(EliminarDialogComponent, {
      autoFocus:true,
      data: nombre
    });

    dialogRef.afterClosed().subscribe(tengoQueEliminar => {
      if (tengoQueEliminar) {
        this.eliminarTransportista(element);
      }
    });
  }

  eliminarTransportista(transportista: any) {
    this.electronService.ipcRenderer.send('transportista:eliminarTransportista', transportista.idTransportista, transportista.idCamion);
  }
}
