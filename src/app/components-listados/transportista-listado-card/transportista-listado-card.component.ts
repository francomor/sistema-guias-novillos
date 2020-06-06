import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ElectronService } from '../../core/services/electron/electron.service';


@Component({
  selector: 'app-transportista-listado-card',
  templateUrl: './transportista-listado-card.component.html',
  styleUrls: ['./transportista-listado-card.component.scss']
})
export class TransportistaListadoCardComponent implements OnInit {
  displayedColumns: string[] = ['CUIT', 'RazonSocial', 'ChapaChasis', 'ChapaAcoplado', 'Chofer'];
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
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datosTabla = this.todosLosDatosTabla.filter((comprador)=>{
      return comprador.RazonSocial.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0; 
    });
    // refresh view
    this.changeDetectorRefService.detectChanges();
  }

  onCuitClick(event) {
    const cuitTransportista = event.target.innerHTML.trim();
    const transportistaSeleccionado = this.todosLosDatosTabla.find(element => element.CUIT == cuitTransportista);
    localStorage.setItem('TransportistaCUIT', JSON.stringify(cuitTransportista));
    localStorage.setItem('TransportistaIDCamionSeleccionado', JSON.stringify(transportistaSeleccionado.idCamion));
    this.openSnackBar("Transportista con CUIT " + event.target.innerHTML + " fue seleccionado con éxito", "");
  }

  openSnackBar(message: string, action: string) {
    this.zone.run(() => {
      this._snackBar.open(message, action, {
        duration: 2000,
      });
    });
  }
}
