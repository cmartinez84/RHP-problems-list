import { Component } from '@angular/core';
import { PatientDataService } from './../patient-data.service';
import { BaseApp } from './../baseApp';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'patient-summary',
  inputs: ['patientId'],
  providers: [PatientDataService],
  template: `
    <div [ngStyle]="{ 'padding': '20px'}">
      <img [src]="photoSrc" (error)="useDefaultImage($event.target)" class="patient-photo">
      <p>{{summary}}</p>
    </div>
  `
})

export class PatientSummaryComponent extends BaseApp {
  private patientId: string;
  private summary: string;
  private photoSrc: string;

  constructor(private pds: PatientDataService) {
    super();
    let Component = this;
    this.updateFunctions['patientId'] = function() { Component.getPatientData(); }
    this.componentName = "PatientSummaryComponent";
    this.summary = "No Summary Found";
    this.patientId = '1';
    this.photoSrc = '';
    this.title = 'Patient Summary';
    this.defaultWidth = 210;
    this.defaultHeight = 480;
  }

  ngOnInit() {
    this.getPatientData();
  }

  getPatientData() {
    let comp = this;
    this.pds.getSummary(this.patientId).subscribe(function(response: any) {
      let res = response.json();
      comp.summary = res[0] != undefined ? res[0].clinicalsummary : "No Summary Found";
    });
    this.pds.getPhotoSrc(this.patientId).subscribe(function(response: any) {
      comp.photoSrc = response.json()["url"];
    });
  }

  useDefaultImage(img) {
    img.src = 'assets/profile_default.jpg';
  }
}
