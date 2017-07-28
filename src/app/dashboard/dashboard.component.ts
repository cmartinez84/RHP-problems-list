import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { PatientSelectComponent } from './../patient-select/patient-select.component';
import { PatientSummaryComponent } from './../patient-summary/patient-summary.component';
import { WellnessScoreComponent } from './../wellness-score/wellness-score.component';
import { ChecklistTableComponent } from './../checklist-table/checklist-table.component';
import { LineGraphComponent } from './../line-graph/line-graph.component';
import { InfoPanelComponent } from './../info-panel/info-panel.component';
import { ClinicaleventChartComponent } from './../clinicalevent-chart/clinicalevent-chart.component';
import { ProblemsListComponent } from './../problems-list/problems-list.component';
import { CustomAppComponent } from './../custom/custom.component';
import * as d3 from 'd3';
import { AppComponents } from './../appcomponents.model';
import { PhysicianDataService } from './../physician-data.service';

@Component({
  selector: 'app-dashboard',
  providers: [PhysicianDataService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent {
  private physicianId;
  private patientId;
  private settings: any;
  @ViewChild('mainDash', {read: ViewContainerRef}) private mainDash: ViewContainerRef;
  private childComponents: any;
  private moved: any;
  private movedOffsetX: number;
  private movedOffsetY: number;
  private resized: any;
  private resizeBeginX: number;
  private resizeBeginY: number;
  private resizeBeginWidth: number;
  private resizeBeginHeight: number;
  private menuShowing: boolean;

  constructor(private factory: ComponentFactoryResolver, private pds: PhysicianDataService) {
    this.childComponents = [];
    this.menuShowing = false;
  }

  ngOnInit() {
    d3.select('body').style('background-color', 'white');
    this.physicianId = "1";
    this.choosePatient("1");

    let comp = this;

    this.resized = undefined;
    d3.select(window)
      .on('mousemove touchmove', function() {
        let cX = d3.event.x === undefined ? d3.event.touches[0].clientX : d3.event.x;
        let cY = d3.event.y === undefined ? d3.event.touches[0].clientY : d3.event.y;
        if(comp.moved) {
          let dashCoords = comp.moved.node().parentNode.getBoundingClientRect();
          comp.moved.style('left', comp.pxToPercent(cX-dashCoords.left-comp.movedOffsetX) + '%');
          comp.moved.style('top', cY-dashCoords.top-comp.movedOffsetY + 'px');
        }
        if(comp.resized) {
          let movedX = cX - comp.resizeBeginX;
          let movedY = cY - comp.resizeBeginY;
          let newWidth = comp.pxToPercent(comp.resizeBeginWidth + movedX);
          let newHeight = comp.resizeBeginHeight + movedY;
          comp.resized.style('width', newWidth + '%');
          let headerHeight = parseInt(comp.resized.select('.panel-heading').style('height'));
          if(newHeight > headerHeight + 21 + 50) {
            if(comp.resized.classed('patient-select')) {
              comp.resized.select('.app-panel-body').style('display', 'inherit');
            }
            comp.resized.style('height', newHeight + 'px');
            comp.resized.select('.app-panel-body').style('height', newHeight - headerHeight - 21 - 2 + 'px');
            for(let child of comp.childComponents) {
              if(child.location.nativeElement.parentNode.parentNode === comp.resized.node()) {
                child.instance.onResize();
              }
            }
          } else {
            if(comp.resized.classed('patient-select')) {
              comp.resized.select('.app-panel-body').style('display', 'none');
            }
            comp.resized.style('height', headerHeight + 21 + 2 +'px');
            comp.resized.select('.app-panel-body').style('height', '0px');
          }
        }
      })
      .on('mouseup touchend', function() {
        if(comp.moved || comp.resized) {
          let st = parseInt(d3.select('html').style('top'));
          d3.select('html').attr('class', '');
          document.body.scrollTop = -st;
          comp.moved = undefined;
          comp.resized = undefined;
          comp.setSettings();
        }
      });
  }

  buildDash(apps) {
    this.menuShowing = false;
    for(let app of apps) {
      if(app.selected) {
        this.insertApp(app.idString, app.item);
      }
    }
    d3.selectAll('.app-panel').attr('class', 'panel panel-primary app-panel');
    if(this.childComponents.length > 0) {
      this.childComponents[this.childComponents.length - 1].location.nativeElement.parentNode.parentNode.className = 'panel panel-primary app-panel active-panel';
    }
  }

  buildDashFromSettings() {
    let storedSettings = localStorage.getItem("physician-"+this.physicianId+"-patient-"+this.patientId+"-settings");
    let allGood = true;
    this.settings = [];
    try {
      this.settings = JSON.parse(storedSettings);
    } catch(e) {
      allGood = false;
    }
    if(!Array.isArray(this.settings)) { allGood = false; }
    if(allGood) {
      for(let ss of this.settings) {
        if(!(ss["height"] && ss["left"] && ss["name"] && ss["top"] && ss["width"])) {
          allGood = false;
          break;
        }
      }
    }
    if(allGood) {
      for(let index in this.settings) {
        let i = parseInt(index);
        let appsetting = this.settings[i];
        this.insertApp(appsetting["name"], appsetting["item"], i);
      }
      if(this.settings.length > 0) {
        this.childComponents[this.childComponents.length - 1].location.nativeElement.parentNode.parentNode.className = 'panel panel-primary app-panel active-panel';
      }
    } else {
      this.settings = [];
      this.insertApp("PatientSummaryComponent");
      localStorage.removeItem("physician-"+this.physicianId+"-patient-"+this.patientId+"-settings");
    }
  }

  attachPanelManipulators(item) {
    let comp = this;
    let el = item.location.nativeElement.parentNode.parentNode;
    let resizeHandle = d3.select(el)
      .append('svg')
        .style('cursor', 'nwse-resize')
        .attr('class', 'resize-handle');
    resizeHandle.on('mousedown touchstart', function(d: any) {
        let element: any;
        element = resizeHandle.node();
        let st = document.documentElement.scrollTop;
        st = st ? st : document.body.scrollTop;
        d3.select('html').attr('class', 'noscroll').style('top', -st + 'px');
        comp.resizeBeginX = d3.event.x === undefined ? d3.event.touches[0].clientX : d3.event.x;
        comp.resizeBeginY = d3.event.y === undefined ? d3.event.touches[0].clientY : d3.event.y;
        comp.resized = d3.select(element.parentNode);
        comp.resizeBeginWidth = parseInt(d3.select(element.parentNode).style('width'));
        comp.resizeBeginHeight = parseInt(d3.select(element.parentNode).style('height'));
      })
      .append('polygon')
      .attr('points', '5,15 15,15 15,5')
      .style('fill', 'gray');
    let dragHandle = d3.select(el).select('.drag-handle');
    dragHandle.on('mousedown touchstart', function(d: any) {
      let element: any;
      element = dragHandle.node();
      let st = document.documentElement.scrollTop;
      st = st ? st : document.body.scrollTop;
      d3.select('html').attr('class', 'noscroll').style('top', -st + 'px');

      comp.moved = d3.select(element.parentNode);
      let coords = element.getBoundingClientRect();
      comp.movedOffsetX = (d3.event.x === undefined ? d3.event.touches[0].clientX : d3.event.x) - coords.left;
      comp.movedOffsetY = (d3.event.y === undefined ? d3.event.touches[0].clientY : d3.event.y) - coords.top;
    });
    d3.select(el).on('mousedown touchstart', function() {
      d3.selectAll('.app-panel').attr('class', 'panel panel-primary app-panel');
      d3.select(this).attr('class', 'panel panel-primary app-panel active-panel');
    });
    d3.select(el).select('.panel-heading')
      .insert('div', ':first-child')
        .text('X')
        .attr('class', 'close')
        .on('click', function(d: any) {
          item.destroy();
          el.remove();
          comp.childComponents.splice(comp.childComponents.indexOf(item), 1);
          comp.setSettings();
          if(comp.settings.length > 0) {
            comp.childComponents[comp.childComponents.length - 1].location.nativeElement.parentNode.parentNode.className = 'panel panel-primary app-panel active-panel';
          }
        });
  }

  insertApp(componentString: string, item = '', settingIndex = -1) {
    let comp = this;
    let component: any;
    if(componentString === 'PatientSummaryComponent') {
      component = this.mainDash.createComponent(this.factory.resolveComponentFactory(PatientSummaryComponent));
    } else if(componentString === 'WellnessScoreComponent') {
      component = this.mainDash.createComponent(this.factory.resolveComponentFactory(WellnessScoreComponent));
    } else if(componentString === 'ChecklistTableComponent') {
      component = this.mainDash.createComponent(this.factory.resolveComponentFactory(ChecklistTableComponent));
    } else if(componentString === 'LineGraphComponent') {
      component = this.mainDash.createComponent(this.factory.resolveComponentFactory(LineGraphComponent));
    } else if(componentString === 'ClinicaleventChartComponent') {
      component = this.mainDash.createComponent(this.factory.resolveComponentFactory(ClinicaleventChartComponent));
    } else if(componentString === 'InfoPanelComponent') {
      component = this.mainDash.createComponent(this.factory.resolveComponentFactory(InfoPanelComponent));
      component.instance.item = item;
    } else if(componentString === 'ProblemsListComponent') {
      component = this.mainDash.createComponent(this.factory.resolveComponentFactory(ProblemsListComponent));
      component.instance.item = item;
    } else if(componentString === 'CustomAppComponent') {
      component = this.mainDash.createComponent(this.factory.resolveComponentFactory(CustomAppComponent));
      component.instance.request = item;
    } else {
      return {};
    }
    let appSetting = this.settings[settingIndex];
    let l = appSetting ? appSetting["left"] : '20px';
    let t = appSetting ? appSetting["top"] : '20px';
    let w = appSetting ? appSetting["width"] : comp.pxToPercent(component.instance.defaultWidth) + '%';
    let h = appSetting ? appSetting["height"] : component.instance.defaultHeight + 'px';
    let newPanel = d3.select(this.mainDash.element.nativeElement).append('div')
      .attr('class', 'panel panel-primary app-panel')
      .style('width', w)
      .style('height', h)
      .style('position', 'absolute')
      .style('top', t)
      .style('left', l);
    let header = newPanel.append('div').attr('class', 'panel-heading drag-handle').style('cursor', 'move');
    header.append('span').style('font-size', '18px')
      .text(component.instance.title)
      .style('margin', '0px')
      .style('cursor', 'default');
    let headerHeight = parseInt(header.style('height'));
    let panelBody = newPanel.append('div')
      .attr('class', 'app-panel-body')
      .style('height', parseInt(h) - headerHeight - 21 - 2 + "px");
    panelBody.append(function(){return component.location.nativeElement;});
    newPanel.append('div').attr('class', 'panel-footer');

    this.attachPanelManipulators(component);
    this.childComponents.push(component);
    component.instance.update('patientId', comp.patientId);
    this.setSettings();
    return component;
  }

  choosePatient(id = this.patientId) {
    for(let child of this.childComponents) {
      child.destroy();
    }
    this.childComponents = [];
    d3.select('#mainDash').selectAll('*').remove();

    this.patientId = id;
    this.buildDashFromSettings();
    for (let comp of this.childComponents) {
      comp.instance.update('patientId', id);
    }
  }

  setSettings() {
    let settings = [];
    for(let child of this.childComponents) {
      let el = d3.select(child.location.nativeElement.parentNode.parentNode);
      let setting = {
        name: child.instance.componentName,
        item: child.instance.item,
        left: el.node().style.left,
        top: el.style('top'),
        width: el.node().style.width,
        height: el.style('height')
      }
      settings.push(setting);
    }
    localStorage.setItem("physician-"+this.physicianId+"-patient-"+this.patientId+"-settings", JSON.stringify(settings));
  }

  pxToPercent(pix) {
    let w = parseInt(d3.select('#mainDash').style('width'));
    return (pix/w)*100;
  }

  showHidePanel(panelElement, button) {
    if(panelElement.style.display === 'none') {
      panelElement.style.display = '';
      d3.selectAll('.app-panel').attr('class', 'panel panel-primary app-panel');
      d3.select(panelElement).attr('class', 'panel panel-primary app-panel active-panel');
    } else {
      if(panelElement.className === 'panel panel-primary app-panel') {
        d3.selectAll('.app-panel').attr('class', 'panel panel-primary app-panel');
        d3.select(panelElement).attr('class', 'panel panel-primary app-panel active-panel');
      } else {
        panelElement.style.display = 'none';
      }
    }
  }

}
