import { Component, OnInit } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-lista-transportista',
  templateUrl: './lista-transportista.component.html',
  styleUrls: ['./lista-transportista.component.scss']
})
export class ListaTransportistasComponent implements OnInit {
  small = false;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.breakpointObserver.observe(Breakpoints.Handset).subscribe(({ matches }) => {
      this.small = matches;
    });
  }
}
