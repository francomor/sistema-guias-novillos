import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ElectronService } from '../../core/services/electron/electron.service';


@Component({
  selector: 'app-boletos-listado-marca-card',
  templateUrl: './boletos-listado-marca-card.component.html',
  styleUrls: ['./boletos-listado-marca-card.component.scss']
})
export class BoletosListadoMarcaCardComponent implements OnInit {
  displayedColumns: string[] = [
    'VencimientoBoleto', 'RENSPA', 'RazonSocial', 
    'BoletoMarca', 'BoletoMarcaInc', 'BoletoMarcaFolio', 
    'Telefono', 'Email'
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
      datos.sort(this.productor_date_compare);
      datos.sort(this.productor_date_compare);
      this.todosLosDatosTabla = datos;
      this.datosTabla = datos;
      this.isLoading = false;
      // refresh view
      this.changeDetectorRefService.detectChanges();
    });
  }

  productor_date_compare(a, b) {
    // Penalizo
    let venc_a = new Date("December 17, 1995 03:24:00"); 
    let venc_b = new Date("December 17, 1995 03:24:00"); 

    if (a.VencimientoBoletoMarca) {
      let parts = a.VencimientoBoletoMarca.trim().split('-');
      parts.forEach(function(part, index) {
        this[index] = parseInt(this[index]);
      }, parts);
      const venc_marca = new Date(parts[2], parts[1] - 1, 1); 
        venc_a = venc_marca;
    }

    if (b.VencimientoBoletoMarca) {
      let parts_b = b.VencimientoBoletoMarca.trim().split('-');
      parts_b.forEach(function(part, index) {
        this[index] = parseInt(this[index]);
      }, parts_b);
      // Please pay attention to the month (parts_b[1]); JavaScript counts months from 0:
      // January - 0, February - 1, etc.
      const venc_marca_b = new Date(parts_b[2], parts_b[1] - 1, 1); 
        venc_b = venc_marca_b;
    }
    
    if ( venc_a < venc_b ){
      return -1;
    }
    if ( venc_a > venc_b ){
      return 1;
    }
    return 0;
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
