import { Component, Injectable, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as d3TimeFormat from 'd3-time-format';

import { ClinicalEventReport } from './models/clinical-event-report';
import { PatientDataService } from './../patient-data.service';
import { BaseApp } from './../baseApp';

@Component({
  selector: 'clinicalevent-chart',
  templateUrl: './clinicalevent-chart.component.html',
  styleUrls: ['./clinicalevent-chart.component.css'],
  providers: [PatientDataService]

})

@Injectable()
export class ClinicaleventChartComponent extends BaseApp {
  private patientId: string;

  @ViewChild('chart') private chartContainer: ElementRef;
  scalePadding: number = 15;
  dataset2 = [0, 5, 15, 10, 8, 16, 25, 0, -10, -15];
  private margin: any = { top: 20, bottom: 20, left: 20, right: 80 };
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;
  private readonly verticalTextOffset: number = 4;
  private barColor: string = "lightgray";
  private dotColor: string = "black";
  private labelColor: string = "darkblue";
  private numberOfVerticalEntrySlots: number = 10;
  private dateTicks: number = 5;


  public dataset: Object[];

  constructor(public dataService: PatientDataService) {
    super();
    let Component = this;
    this.onResize = function() { this.createChart(); }
    this.componentName = "ClinicaleventChartComponent";
    this.title = "Clinical Events";
    this.defaultWidth = 760;
    this.defaultHeight = 750;
    this.patientId = "1";
  }

  createChart() {
    let comp = this;
    this.dataService.getClinicalEventData(this.patientId).subscribe(function(response: any) {
      comp.dataset = response.json();
      let clinicalEventReport = new ClinicalEventReport(comp.dataset, 20, comp.verticalTextOffset);

      let element = comp.chartContainer.nativeElement;
      comp.width = element.offsetWidth;
      comp.height = element.offsetHeight;

      let selectedElement = d3.select(element);
      selectedElement.selectAll("*").remove();

      let svg = selectedElement.append("svg")
        .attr('width', comp.width)
        .attr('height', comp.height);

      // define domains
      let minDate = clinicalEventReport.wrappedItems[0].itemDate;
      let maxDate = clinicalEventReport.wrappedItems[clinicalEventReport.wrappedItems.length - 1].itemDate;

      let xDomain = [minDate, maxDate];
      let yDomain = [-50, 50];

      let xBottomScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([comp.margin.left, comp.width - comp.margin.right]);

      comp.xScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([comp.margin.left, comp.width - comp.margin.right]);

      comp.yScale = d3.scaleLinear()
        .domain(yDomain)
        .range([0, comp.height]);


      let xDateAxisGen = d3.axisTop(xBottomScale).ticks(comp.dateTicks).tickFormat(d3.timeFormat("%b"));

      //add bars
      let bars = svg.selectAll("rect")
        .data(clinicalEventReport.wrappedItems)
        .enter()
        .append("rect")
        .attr("x", (d, i) => comp.xScale(d.itemDate))
        .attr("y", (d, i) => d.item.eventtype == 1 ? comp.height - comp.yScale((d.yValue)) : comp.yScale(0))
        .attr("width", 2)
        .attr("height", (d, i) => Math.abs(comp.yScale(d.yValue) - comp.yScale(0)))
        .attr("fill", comp.barColor);

      //labels
      let labels = svg.selectAll("text")
        .data(clinicalEventReport.wrappedItems)
        .enter()
        .append("text")
        .text((d) => d.item.clinicalevent)
        .attr("x", (d, i) => comp.xScale(d.itemDate) + 4)
        .attr("y", (d, i) => comp.height + 4 - comp.yScale(d.yValue))
        .attr("font-size", "14px")
        .attr("font-family", "sans-serif")
        .attr("fill", comp.labelColor)
        .attr("text-anchor", "right")
        ;

      //add circles
      let dots = svg.selectAll("circle")
        .data(clinicalEventReport.wrappedItems)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => comp.xScale(d.itemDate))
        .attr("cy", (d, i) => comp.height - comp.yScale(d.yValue))
        .attr("r", 3)
        .attr("fill", comp.dotColor);

      // x & y axis
      comp.xAxis = svg.append('g')
        .attr('class', 'axis axis-yZero')
        .attr('transform', `translate(0, ${comp.yScale(0)})`)//place an axis at y=0
        .call(d3.axisBottom(comp.xScale).tickFormat((d) => "").tickSize(0))//style the axis
        ;
      let xBottomAxis = svg.append('g')
        .call(xDateAxisGen)
        .attr('class', 'axis bottomAxis')
        .attr('transform', `translate(0, ${comp.height - comp.margin['bottom']})`)
        ;
    });

  }

 ngOnChanges(){
       //this.createChart();
 }

  ngOnInit() {
    this.createChart();
  }

}
