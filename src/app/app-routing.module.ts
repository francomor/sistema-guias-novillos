import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainNavComponent } from './home/main-nav/main-nav.component';
import { PrincipalComponent } from './home/principal/principal.component';
import { ListaCompradoresComponent } from './home/lista-compradores/lista-compradores.component';
import { ListaProductoresComponent } from './home/lista-productores/lista-productores.component';
import { ListaTransportistasComponent } from './home/lista-transportista/lista-transportista.component';

const routes: Routes = [
  { path: 'home', component: MainNavComponent,
    children: [
      { path: '', redirectTo: 'principal', pathMatch: 'full' },
      { path: 'principal', component: PrincipalComponent},
      { path: 'lista-compradores', component: ListaCompradoresComponent},
      { path: 'lista-productores', component: ListaProductoresComponent},
      { path: 'lista-transportistas', component: ListaTransportistasComponent},
    ],
    runGuardsAndResolvers: 'always',
  },
  { path: '', redirectTo: '/home/principal', pathMatch: 'full' },
  { path: '**', redirectTo: '/home/principal', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
