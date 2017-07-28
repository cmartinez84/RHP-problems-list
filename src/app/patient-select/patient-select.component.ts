import { Component, EventEmitter } from '@angular/core';
import { PhysicianDataService } from './../physician-data.service';
import { PatientDataService } from './../patient-data.service';
import { BaseApp } from './../baseApp';

@Component({
  selector: 'patient-select',
  outputs: ['onSelect'],
  providers: [PhysicianDataService, PatientDataService],
  template: `
    <div class="patient-selector" [ngStyle]="{ 'background-color':'lightsteelblue' }">
      <div [ngStyle]="{ 'float':'left', 'width':'70px', 'height':'70px', 'padding':'10px' }">
        <img src={{picSrc}} alt="patient photo" (error)="picSrc = 'assets/profile_default.jpg'" [ngStyle]="{ 'width':'100%', 'height':'100%', 'border-radius':'25px' }">
      </div>
      <div [ngStyle]="{ 'float':'left', 'margin-top':'10px' }">
          <div [ngStyle]="{ 'margin-bottom':'5px' }"><strong>{{name}} - DOB:</strong> {{bday}}</div>
          <select (change)="makeSelection($event.target, search)" [ngStyle]="{ 'height':'26px' }">
            <option disabled>Today's Patients</option>
            <option *ngFor="let patient of todaysPatients" value={{patient.patientid}}>{{patient.displayname}}</option>
          </select>
          <div class="break"><br><br></div>
          <select (change)="makeSelection($event.target, search)" [ngStyle]="{ 'height':'26px' }">
            <option disabled>Tomorrow's Patients</option>
            <option *ngFor="let patient of tomorrowsPatients" value={{patient.patientid}}>{{patient.displayname}}</option>
          </select>
          <div class="break"><br><br></div>
          <div class="patient-search-field">
            <input #search type="text" placeholder="Search Patients" (keyup)="searchPatients($event, results)">
            <ul *ngIf="foundPatients.length > 0" #results [ngStyle]="{ 'width': '100%', 'background-color': 'white', 'border': '1px solid', 'position': 'relative', 'z-index':'2', 'list-style': 'none', 'padding-left': '0px', 'text-align': 'center' }" >
              <li *ngFor="let patient of foundPatients" (click)="makeSelection($event.target, search)" (mouseenter)="highlight(patient)" value={{patient.patientid}} [ngStyle]="getLiStyle(patient)">{{patient.displayname}}</li>
            </ul>
          </div>
      </div>
      <ul class="nav">
        <li class="dropdown" [ngStyle]="{ 'height':'100%' }">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown" [ngStyle]="{ 'height':'100%', 'padding':'25px', 'color':'#333' }">Dr. Martin <b class="caret"></b></a>
          <ul class="dropdown-menu animated fadeInUp">
            <li><a href="profile.html">Profile</a></li>
            <li><a href="login.html">Logout</a></li>
          </ul>
        </li>
      </ul>
    </div>
  `
})

export class PatientSelectComponent {
  private physicianId: string;
  public onSelect: EventEmitter<string>;
  private allPatients: Object[];
  private foundPatients: Object[];
  private todaysPatients: Object[];
  private tomorrowsPatients: Object[];
  private highlightedPatient: Object;
  private picSrc: string;
  private name: string;
  private bday: string;

  constructor(private pds: PhysicianDataService, private pntds: PatientDataService) {
    this.physicianId = '1';
    this.foundPatients = new Array();
    this.onSelect = new EventEmitter();
    this.picSrc = 'assets/profile_default.jpg';
    this.name = 'Patient Not Found';
    this.bday = '01-01-1900';
  }

  ngOnInit() {
    this.getPhysicianData();
  }

  getPhysicianData() {
    let comp = this;
    this.pds.getTodaysPatients(this.physicianId).subscribe(function(response: any) {
      comp.todaysPatients = response.json();
    });
    this.pds.getTomorrowsPatients(this.physicianId).subscribe(function(response: any) {
      comp.tomorrowsPatients = response.json();
    });
    this.pds.getAllPatients(this.physicianId).subscribe(function(response: any) {
      comp.allPatients = response.json();
      comp.getPatientData("1");
    });
  }

  getPatientData(id) {
    let comp = this;
    this.pntds.getPhotoSrc(id).subscribe(function(response: any) {
      comp.picSrc = response.json()["url"];
    });
    for(let p of this.allPatients) {
      if(p['patientid']==id) {
        this.name = p['displayname'];
        this.bday = p['dob'];
      }
    }
  }

  highlight(pat) {
    this.highlightedPatient = pat;
  }

  getLiStyle(pat) {
    return { 'cursor': 'pointer', 'background-color': (pat===this.highlightedPatient ? 'cornflowerblue' : 'inherit') };
  }

  makeSelection(sel, searchField = undefined) {
    let id = sel.value ? sel.value : sel.patientid;
    this.onSelect.emit(id.toString());
    sel.selectedIndex = 0;
    if(searchField) {
      searchField.value = '';
    }
    this.foundPatients = [];
    this.getPatientData(id);
  }

  searchPatients(event, results) {
    let val = event.target.value;
    if(val.length > 1) {
      let found = this.allPatients.filter(function(patient: any){
        let caseinsName = patient.displayname.toLowerCase();
        let caseinsSearch = val.toLowerCase();
        return caseinsName.includes(caseinsSearch);
      });
      this.foundPatients = found;
      if(this.foundPatients.indexOf(this.highlightedPatient) === -1) {
        this.highlightedPatient = this.foundPatients[0];
      }
      if(event.keyCode === 13) {
        this.makeSelection(this.highlightedPatient, event.target);
      } else if(event.keyCode === 38) {
        let newIndex = this.foundPatients.indexOf(this.highlightedPatient) - 1;
        newIndex = newIndex < 0 ? this.foundPatients.length-1 : newIndex;
        this.highlightedPatient = this.foundPatients[newIndex];
      } else if(event.keyCode === 40) {
        let newIndex = this.foundPatients.indexOf(this.highlightedPatient) + 1;
        newIndex = newIndex > this.foundPatients.length-1 ? 0 : newIndex;
        this.highlightedPatient = this.foundPatients[newIndex];
      }
    } else {
      this.foundPatients = [];
    }
  }

}
