import { Component, OnInit } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-lista-boletos-marca',
  templateUrl: './lista-boletos-marca.component.html',
  styleUrls: ['./lista-boletos-marca.component.scss']
})
export class ListaBoletosMarcaComponent implements OnInit {
  small = false;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.breakpointObserver.observe(Breakpoints.Handset).subscribe(({ matches }) => {
      this.small = matches;
    });
  }
}
