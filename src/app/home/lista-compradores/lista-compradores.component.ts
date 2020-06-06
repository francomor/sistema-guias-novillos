import { Component, OnInit } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-lista-compradores',
  templateUrl: './lista-compradores.component.html',
  styleUrls: ['./lista-compradores.component.scss']
})
export class ListaCompradoresComponent implements OnInit {
  small = false;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.breakpointObserver.observe(Breakpoints.Handset).subscribe(({ matches }) => {
      this.small = matches;
    });
  }
}
