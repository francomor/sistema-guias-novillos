import 'reflect-metadata';
import '../polyfills';

import { registerLocaleData, DecimalPipe } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';

import {A11yModule} from '@angular/cdk/a11y';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { LayoutModule } from '@angular/cdk/layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule , MatRippleModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from './app-routing.module';
import { NgxBarcode6Module } from 'ngx-barcode6';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { PrincipalComponent } from './home/principal/principal.component';
import { MainNavComponent } from './home/main-nav/main-nav.component';
import { ProductorsCardComponent } from './components/productor-card/productor-card.component'
import { ProductorsUpsertComponent } from './components/productor-upsert-card/productor-upsert-card.component'
import { CompradorCardComponent } from './components/comprador-card/comprador-card.component'
import { CompradorUpsertComponent } from './components/comprador-upsert-card/comprador-upsert-card.component'
import { TransportistaCardComponent } from './components/transportista-card/transportista-card.component'
import { TransportistaUpsertComponent } from './components/transportista-upsert-card/transportista-upsert-card.component'
import { PrincipalCoreCardComponent } from './components/principal-core-card/principal-core-card.component'
import { PrincipalCoreDialogComponent } from './components/principal-core-dialog-card/principal-core-dialog-card.component'
import { PrincipalCorePrintHelperComponent } from './components/principal-core-print-helper-card/principal-core-print-helper-card.component'
import { ListaTransportistasComponent } from './home/lista-transportista/lista-transportista.component'
import { ListaCompradoresComponent } from './home/lista-compradores/lista-compradores.component'
import { ListaProductoresComponent } from './home/lista-productores/lista-productores.component'
import { CompradorListadoCardComponent } from './components-listados/comprador-listado-card/comprador-listado-card.component'
import { ProductorListadoCardComponent } from './components-listados/productor-listado-card/productor-listado-card.component'
import { TransportistaListadoCardComponent } from './components-listados/transportista-listado-card/transportista-listado-card.component'

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

registerLocaleData(localeEsAr, 'es-Ar');

@NgModule({
  declarations: [
    AppComponent,
    PrincipalComponent,
    MainNavComponent,
    ProductorsCardComponent,
    ProductorsUpsertComponent,
    CompradorCardComponent,
    CompradorUpsertComponent,
    TransportistaCardComponent,
    TransportistaUpsertComponent,
    PrincipalCoreCardComponent,
    PrincipalCoreDialogComponent,
    PrincipalCorePrintHelperComponent,
    ListaCompradoresComponent,
    CompradorListadoCardComponent,
    ListaProductoresComponent,
    ProductorListadoCardComponent,
    TransportistaListadoCardComponent,
    ListaTransportistasComponent
  ],
  imports: [
    NgxBarcode6Module,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    A11yModule,
    ClipboardModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CoreModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    DecimalPipe, 
    { provide: LOCALE_ID, useValue: 'es-Ar' }, 
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ],
  entryComponents: [
    ProductorsUpsertComponent,
    CompradorUpsertComponent,
    TransportistaUpsertComponent,
    PrincipalCoreDialogComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
