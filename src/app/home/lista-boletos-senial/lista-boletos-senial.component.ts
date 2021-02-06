import { Component, OnInit } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-lista-boletos-senial',
  templateUrl: './lista-boletos-senial.component.html',
  styleUrls: ['./lista-boletos-senial.component.scss']
})
export class ListaBoletosSenialComponent implements OnInit {
  small = false;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.breakpointObserver.observe(Breakpoints.Handset).subscribe(({ matches }) => {
      this.small = matches;
    });
  }
}
