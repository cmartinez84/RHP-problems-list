import { Component, EventEmitter } from '@angular/core';
import { PanelInfo } from './../info-panel/panelInfo';

@Component({
  selector: 'app-selector',
  outputs: ['onSelect'],
  template: `
    <div class="main-board" [ngStyle]="{ 'background-color':'white' }">
      <div class="apps-board" [ngStyle]="{ }">
        <div *ngFor="let app of apps; let i=index;" [ngStyle]="{ 'float':'left', 'width':'150px', 'height':'200px', 'overflow':'hidden', 'margin':'5px', 'position':'relative' }">

          <div [ngStyle]="{ 'position':'absolute', 'pointer-events':'none', 'height':'100%', 'width':'100%', 'top':'0%',
                            'left':'0%', 'border':app===displayedApp ? '5px solid cornflowerblue' : '1px solid lightgray' }">
            <div [ngStyle]="{ 'width':'100%', 'height':'100%', 'background-color':'darkblue', 'opacity': app.selected ? '0.2':'0' }"></div>
          </div>
          <div [ngStyle]="{ 'padding':'10px', 'background-color':'#efefef', 'border-bottom':'1px solid lightgray' }">
            <input [ngStyle]="{ 'float':'right', 'margin':'5px' }" type="checkbox" [(checked)]="app.selected" (change)="selectDeselect(app)" />
            <span (click)="changeDisplayed(i)" [ngStyle]="{ 'cursor':'pointer' }">{{app.title}}</span><span *ngIf="app.idString==='InfoPanelComponent'"> ({{info[app.item].title}})</span>
          </div>
          <div [ngStyle]="{ 'background-color':'#111', 'height':'100%', 'display':'flex', 'justify-content':'center' }">
            <img [src]="app.imageSrc" [ngStyle]="{ 'height':'170px', 'flex-shrink':'0', 'cursor':'pointer' }" (click)="changeDisplayed(i)">
          </div>
        </div>
        <div [ngStyle]="{ 'float':'left', 'width':'150px', 'height':'200px',
              'overflow':'hidden', 'margin':'5px', 'position':'relative', 'border':'1px solid lightgray', 'cursor':'pointer' }">
          <div [ngStyle]="{ 'background-color':'#efefef', 'height':'100%' }">
            <h3 (click)="alert('No App Store Yet!');" [ngStyle]="{ 'color':'gray', 'text-align':'center', 'margin':'0', 'font-weight':'bold', 'padding-top':'20px' }">App Store</h3>
            <div [ngStyle]="{ 'width':'100%', 'text-align':'center', 'font-size':'100px', 'font-weight':'bold', 'color':'cornflowerblue' }">+</div>
          </div>
        </div>
      </div>
      <div [ngStyle]="{ 'width':'100%' }">
        <div [ngStyle]="{ 'width':'calc(100% - 10px)', 'height':'300px', 'margin-top':'20px', 'margin-bottom':'20px', 'margin-left':'5px', 'border':'1px solid lightgray' }">
          <div [ngStyle]="{ 'height':'100%', 'width':'50%', 'background-color':'#111', 'overflow':'hidden', 'display':'flex', 'justify-content':'center', 'float':'left' }">
            <img [src]="displayedApp.imageSrc" [ngStyle]="{ 'height':'100%', 'flex-shrink':'0' }">
          </div>
          <div [ngStyle]="{ 'width':'50%', 'height':'100%', 'float':'left', 'padding':'30px', 'background-color':'#efefef', 'border-left':'1px solid lightgray' }">
            <h4>{{displayedApp.title}}</h4>
            <select *ngIf="displayedApp.idString==='InfoPanelComponent'" (change)="changeItem($event.target.value)" [ngStyle]="{ 'max-width':'70%' }">
              <option *ngFor="let k of keys" value="{{k}}" [selected]="k===displayedApp.item">{{info[k]["title"]}}</option>
            </select>
            <div *ngIf="displayedApp.idString==='InfoPanelComponent'"><br></div>
            <p>{{displayedApp.description}}</p>
            <button class="btn btn-primary" [ngStyle]="{ 'display':'block', 'margin':'auto' }" (click)="selectDeselect(displayedApp)">{{displayedApp.selected ? 'Deselect' : 'Select'}}</button>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" [ngStyle]="{ 'display':'block', 'margin':'auto' }" (click)="makeSelection()">Done</button>
      </div>
    </div>
  `,
  styleUrls: ['./app-selector.component.css']
})

export class AppSelectorComponent {
  apps: any[];
  info: PanelInfo;
  keys: Array<any>;
  private displayedApp: Object;
  public onSelect: EventEmitter<Object[]>;

  constructor() {
    this.info = new PanelInfo();
    this.keys = Object.keys(this.info);
    this.onSelect = new EventEmitter();
    this.apps = [
      {
        title: 'Clinical Summary',
        selected: false,
        idString: 'PatientSummaryComponent',
        item: '',
        imageSrc: '/assets/Summary.png',
        description: 'Clinically pertinent patient information summarized from multiple EMRs'
      },
      {
        title: 'Wellness Scores',
        selected: false,
        idString: 'WellnessScoreComponent',
        item: '',
        imageSrc: '/assets/WellnessScores.png',
        description: 'Relative compliance with evidence-based clinical guidelines'
      },
      {
        title: 'Chart Summary',
        selected: false,
        idString: 'InfoPanelComponent',
        item: 'medications',
        imageSrc: '/assets/EMR.PNG',
        description: 'Customize which emr components to display in your char summary'
      },
      {
        title: 'Clinical Decision Support',
        selected: false,
        idString: 'ChecklistTableComponent',
        item: '',
        imageSrc: '/assets/Checklist.png',
        description: 'Patient-specific treatment recommendations for MACRA compliance using evidence-based clinical guidelines'
      },
      {
        title: 'Dose Response Curve',
        selected: false,
        idString: 'LineGraphComponent',
        item: '',
        imageSrc: 'assets/DoseResponse.png',
        description: 'Lab results and medication dosage visualization'
      },
      {
        title: 'Clinical Event Timeline',
        selected: false,
        idString: 'ClinicaleventChartComponent',
        item: '',
        imageSrc: 'assets/Clinical Events Timeline.PNG',
        description: 'Problem specific clinical events'
      },
      {
        title: 'Problems',
        selected: false,
        idString: 'ProblemsListComponent',
        item: '',
        imageSrc: 'assets/profile_default.jpg', // TODO: replace with appropriate image
        description: 'Chart for symptoms and diagnoses'
      }
    ];
    this.displayedApp = this.apps[0];
  }

  changeDisplayed(index) {
    this.displayedApp = this.apps[index];
  }

  selectDeselect(app) {
    app.selected = !app.selected;
  }

  makeSelection() {
    this.onSelect.emit(this.apps);
    for(let app of this.apps) {
      app.selected = false;
    }
  }

  changeItem(val) {
    for(let app of this.apps) {
      if(app["idString"]==="InfoPanelComponent") {
        app["item"] = val;
      }
    }
  }
}
