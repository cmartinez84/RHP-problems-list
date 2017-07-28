import { Component, ViewChild, ElementRef } from '@angular/core';
import { DataService } from './../data.service';
import { PanelInfo } from './panelInfo';
import { BaseApp } from './../baseApp';
import * as d3 from 'd3';

@Component({
    selector: 'infoPanel',
    providers: [DataService],
    inputs: ['item'],
    templateUrl: './info-panel.component.html',
    styleUrls: ['./info-panel.component.css'],
})

export class InfoPanelComponent extends BaseApp{
    item: string;
    headers: string[];
    dataItems: any[];
    info: PanelInfo;
    @ViewChild('panel') private panelContainer: ElementRef;
    private toggleScroll: string = "hidden";
    opened: Boolean = true;

    constructor(private ds: DataService) {
      super();
      this.componentName = "InfoPanelComponent";
      this.info = new PanelInfo();
      this.defaultWidth = 730;
      this.defaultHeight = 210;
    }

    ngOnInit() {
      let comp = this;
      setTimeout(function() {
        comp.title = comp.info[comp.item].title;
        d3.select(comp.panelContainer.nativeElement.parentNode.parentNode.parentNode).select('.panel-heading').select('span').text(comp.title);
      }, 100);
      comp.headers = comp.info[comp.item].headers;
      comp.ds.getEMRData(comp.item).subscribe(function(d: any) {
        comp.dataItems = d;
      });
      comp.showHideScrollBars();
    }

    toggleTable() {
        this.opened = !this.opened;
    }

    generateArray(obj) {
        return Object.keys(obj).map((key) => {
            if (key != "headers") {
                return obj[key];
            }
        });
    }
    
    showHideScrollBars() {
        let e = this.panelContainer.nativeElement;
        this.toggleScroll = e.offsetWidth < 630 ? "scroll" : "hidden";
    }

    ngOnChanges() {
        this.showHideScrollBars();
    }

}
