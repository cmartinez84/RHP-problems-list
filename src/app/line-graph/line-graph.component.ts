import { Component } from '@angular/core';
import { Grapher } from './../grapher';
import { DoseResponseDataService } from './../dose-response-data.service';
import { BaseApp } from './../baseApp';
import * as d3 from 'd3';

@Component({
  selector: 'line-graph',
  inputs: ['patientId'],
  providers: [DoseResponseDataService],
  template: '<div class="line-graph"><svg id="graph"></svg></div>'
})

export class LineGraphComponent extends BaseApp{
  private patientId: string;
  private data: any;

  constructor(private drds: DoseResponseDataService) {
    super();
    let Component = this;
    this.updateFunctions['patientId'] = function() { Component.drawGraph(); }
    this.componentName = "LineGraphComponent"
    this.onResize = function() { this.drawGraph(); }
    this.patientId = '1';
    this.defaultWidth = 730;
    this.defaultHeight = 580;
  }

  ngOnInit() {
    this.drawGraph();
    let comp = this;
    d3.select(window).on('resize', function() {
      comp.drawGraph();
    });
  }

  drawGraph() {
    let c = this;
    this.drds.getData(c.patientId).subscribe(function(response: any) {
      let res = c.drds.transformData(response.json(), c.patientId);
      c.data = res.data;
      c.title = res.title;
      let container: any;
      container = d3.select('.line-graph').node();
      d3.select(container.parentNode.parentNode.parentNode).select('.panel-heading').select('span').text(c.title);
      let svg = d3.select('#graph');
      svg.selectAll('*').remove();
      let g = new Grapher();
      g.lineGraph(svg, c.data);
    });
  }
}
