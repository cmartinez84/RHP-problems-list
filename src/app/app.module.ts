import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { AppSelectorComponent } from './app-selector/app-selector.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomAppComponent } from './custom/custom.component';
import { PatientSelectComponent } from './patient-select/patient-select.component';
import { PatientSummaryComponent } from './patient-summary/patient-summary.component';
import { LineGraphComponent } from './line-graph/line-graph.component';
import { DataService } from './data.service'
import { InfoPanelComponent } from './info-panel/info-panel.component';
import { routing } from './app.routing';
import { ProblemsListComponent } from './problems-list/problems-list.component';
import { ProblemListFilterPipe } from './problem-list.pipe';
import { ResolutionSearchFilterPipe } from './resolution-search-filter.pipe';



@NgModule({
  declarations: [
    AppComponent,
    AppSelectorComponent,
    DashboardComponent,
    CustomAppComponent,
    PatientSelectComponent,
    PatientSummaryComponent,
    LineGraphComponent,
    InfoPanelComponent,
    ProblemsListComponent,
    ProblemListFilterPipe,
    ResolutionSearchFilterPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
  ],

  entryComponents: [
    PatientSelectComponent,
    PatientSummaryComponent,
    LineGraphComponent,
    InfoPanelComponent,
    CustomAppComponent,
    ProblemsListComponent
  ],

  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
