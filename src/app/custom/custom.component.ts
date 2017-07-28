import { Component } from '@angular/core';
import { CustomAppService } from './../custom-app.service';
import { BaseApp } from './../baseApp';
import * as d3 from 'd3';

@Component({
  selector: 'custom-app',
  inputs: ['request', 'patientId', 'physicianId'],
  providers: [CustomAppService],
  template: `
    <div id="custom">
      <div [ngStyle]="{ 'display': 'block', 'margin': 'auto', 'width': '250px', 'padding-top': '20px' }">
        <input [(ngModel)]="request" type="text"><button (click)="getApp()" >Go</button>
      </div>
    </div>
  `
})

export class CustomAppComponent extends BaseApp {
  request: string;
  private patientId: string;
  private physicianId: string;
  private customHTML: string;
  private onInit: string;
  private onUpdate: string;

  constructor(private dataService: CustomAppService) {
    super();
    let Component = this;
    this.componentName = "CustomAppComponent";
    this.title = "Custom App";
    this.defaultHeight = 130;
    this.updateMain = function() { eval(Component.onUpdate); }
  }

  ngOnInit() {
    this.getApp();
  }

  getApp() {
    let Component = this;
    let D3 = d3;
    this.dataService.getData(this.request).subscribe(function(response: any) {
      let r = response.json();
      Component.customHTML = r.html;
      d3.select('#custom').html(Component.customHTML);
      Component.onInit = r.init;
      Component.onUpdate = r.update;
      Component.title = r.title;
      Component.defaultWidth = r.defaultWidth;
      Component.defaultHeight = r.defaultHeight;
      Component.onResize = function() { eval(r.resize); };
      let parameters = Object.keys(r.updateParameter);
      for(let par of parameters) {
        Component.updateFunctions[par] = function() { eval(r.updateParameter[par]); }
      }
      eval(Component.onInit);

      //set default dimensions
      let customDiv: any;
      customDiv = d3.select('#custom').node();
      let panel = d3.select(customDiv.parentNode.parentNode.parentNode)
        .style('width', Component.defaultWidth + 'px')
        .style('height', Component.defaultHeight + 'px');
      let headerHeight = parseInt(panel.select('.panel-heading').style('height'));
      panel.select('.app-panel-body').style('height', Component.defaultHeight - headerHeight - 21 - 2 + "px");
      panel.select('.panel-heading').select('span').text(Component.title);
    });
  }

}
