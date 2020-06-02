import { Injectable } from '@angular/core';
import { ElectronService } from '../core/services/electron/electron.service';

@Injectable({
  providedIn: 'root'
})
export class PrintService { 
    constructor(private electronService: ElectronService) { }

    sendCommandToWorker(content) {
      this.electronService.ipcRenderer.send("printPDF", content);
    }
}