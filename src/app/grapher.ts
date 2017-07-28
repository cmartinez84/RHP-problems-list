import * as d3 from 'd3';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';
import * as d3TimeFormat from 'd3-time-format';

export class Grapher {
  exclude: Array<string>;
  constructor() {
    let localEx = localStorage.getItem('exclude');
    if (localEx === null) {
      this.exclude = [];
    } else {
      this.exclude = JSON.parse(localEx);
    }
  }

  linify(points: Array<any>): Array<Object> {
    points.sort(function(a: any, b: any) {
      if (a[0] < b[0]) {
        return -1;
      }
      if (b[0] < a[0]) {
        return 1;
      }
      return 0;
    });
    let lines: Array<Object> = [];
    for (let i = 0; i < points.length - 1; i++) {
      lines.push({p1: points[i], p2: points[i + 1]});
    }
    return lines;
  }

  findMaxMin(metaData: any, data: Array<Array<any>>, isMax: boolean, isX: boolean) {
    let soFar = isMax ? -Infinity : Infinity;
    for (let i = 0; i < data.length; i++) {
      let skip = false;
      let val: any;
      if (typeof data[i][0] === 'object') {
        val = this.findMaxMin(metaData[i], data[i], isMax, isX);
      } else {
        if (this.exclude.indexOf(metaData.name) !== -1) {skip = true; }
        val = isX ? data[i][0] : data[i][1];
      }
      if ((isMax ? val > soFar : val < soFar) && !skip) {
        soFar = val;
      }
    }
    return soFar;
  }

   transformData(data: Array<any>) {
    let transformedData: Array<Array<any>> = [];
    for (let i = 0; i < data.length; i++) {
      let dataset = data[i];
      let ratio = 900 / (dataset.refMax - dataset.refMin);
      let offset = 900 - (dataset.refMax * ratio);
      transformedData.push([]);
      for (let j = 0; j < dataset.values.length; j++) {
        let transformedPoint: Array<any> = [];
        let point = dataset.values[j];
        transformedPoint[0] = Date.parse(point[0]);
        transformedPoint[1] = point[1] * ratio + offset;
        transformedPoint[2] = point[1];
        transformedData[i].push(transformedPoint);
      }
    }
    return transformedData;
  }

  lineGraph(svg: any, rawData: any) {
    let metaData: Array<any> = [];
    for (let i = 0; i < rawData.length; i++) {
      metaData.push({name: rawData[i].name, unit: rawData[i].unit, refMin: rawData[i].refMin, refMax: rawData[i].refMax});
    }
    let data = this.transformData(rawData);
    let h = svg.style('height');
    let w = svg.style('width');
    h = parseFloat(h);
    w = parseFloat(w);
    let padding = 25;
    let paddingLarge = 85;
    let minX: any = this.findMaxMin(metaData, data, false, true);
    let maxX: any = this.findMaxMin(metaData, data, true, true);
    let xInnerPadding = (maxX - minX) / 10;
    maxX += xInnerPadding;
    minX -= xInnerPadding;
    let minY = Math.min(0, this.findMaxMin(metaData, data, false, false));
    let maxY = Math.max(900, this.findMaxMin(metaData, data, true, false));
    let yInnerPadding = (maxY - minY) / 10;
    maxY += yInnerPadding;
    minY -= yInnerPadding;

    let yScale = d3Scale.scaleLinear()
      .domain([minY, maxY])
      .range([h - paddingLarge, padding]);

    let xTimeScale = d3Scale.scaleTime()
      .domain([minX, maxX])
      .range([padding, w - padding]);
    let xAxis = d3Axis.axisBottom(xTimeScale)
      .tickFormat(d3TimeFormat.timeFormat('%m-%d'));
    let horizGuide = svg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (h - paddingLarge) + ')');
    xAxis(horizGuide);

    let graph = svg.append('g');

    // background
    graph.append('rect')
      .attr('x', xTimeScale(minX) - 1)
      .attr('y', yScale(maxY))
      .attr('width', xTimeScale(maxX) - padding + 2)
      .attr('height', yScale(minY) - yScale(maxY))
      .attr('class', 'out-of-range');
    graph.append('rect')
      .attr('x', xTimeScale(minX))
      .attr('y', yScale(900))
      .attr('width', xTimeScale(maxX) - padding)
      .attr('height', yScale(0) - yScale(900))
      .attr('class', 'in-range');

    // legend init
    let legendPadding = 25;
    let legendPointWidth = 6;
    let labelX = padding + legendPadding;
    let legend = graph.append('g').attr('id', 'legend');
    let legendBack = legend.append('rect')
      .attr('x', padding)
      .attr('y', h - paddingLarge + padding)
      .attr('width', w - 2 * padding)
      .attr('height', 50)
      .style('fill', '#ddd')
      .style('stroke', 'black');

    // datasets
    for (let i = 0; i < data.length; i++) {
      let dataSetName = metaData[i].name;
      let dataSetUnit = metaData[i].unit;
      let datasetMin = metaData[i].refMin;
      let datasetMax = metaData[i].refMax;
      let excluded = this.exclude.indexOf(dataSetName) !== -1;
      let grapher = this;
      // legend
      let labelText = legend.append('text')
        .attr('x', labelX)
        .attr('y', h - padding)
        .text(dataSetName + ' (' + dataSetUnit + ')')
        .attr('text-decoration', excluded ? 'line-through' : 'none')
        .on('click', function(){
          let t = d3.select(this).text();
          t = t.slice(0, t.indexOf(' ('));
          if (grapher.exclude.indexOf(t) === -1) {
            grapher.exclude.push(t);
          } else {
            grapher.exclude.splice(grapher.exclude.indexOf(t), 1);
          }
          localStorage.setItem('exclude', JSON.stringify(grapher.exclude));
          svg.selectAll('*').remove();
          grapher.lineGraph(svg, rawData);
        });
      let textWidth = labelText.node().getComputedTextLength();
      legend.append('line')
        .attr('x1', labelX)
        .attr('x2', labelX + textWidth)
        .attr('y1', h - paddingLarge + padding + padding / 2)
        .attr('y2', h - paddingLarge + padding + padding / 2)
        .attr('class', 'series' + Math.min(i, 6) + '-line series-line');
      legend.append('rect')
        .attr('width', legendPointWidth)
        .attr('height', legendPointWidth)
        .attr('x', labelX + textWidth / 2 - legendPointWidth / 2)
        .attr('y', h - paddingLarge + padding + padding / 2 - (legendPointWidth / 2))
        .attr('class', 'series' + Math.min(i, 6) + '-point series-point');
      labelX = labelX + textWidth + legendPadding;

      // trendlines
      if (!excluded) {
      let lineData = this.linify(data[i]);
      let pointWidth = 6;
      let tooltipWidth = 60;
      let tooltipHeight = 30;
      let tooltipTailHeight = 10;
      let tooltipPadding = 6;
      let trendLine = graph.append('g')
        .attr('name', dataSetName)
        .attr('unit', dataSetUnit)
        .attr('refMin', datasetMin)
        .attr('refMax', datasetMax);
      trendLine.selectAll('line')
          .data(lineData)
        .enter().append('line')
          .attr('x1', function(d: any){return xTimeScale(d.p1[0]); })
          .attr('y1', function(d: any){return yScale(d.p1[1]); })
          .attr('x2', function(d: any){return xTimeScale(d.p2[0]); })
          .attr('y2', function(d: any){return yScale(d.p2[1]); })
          .attr('class', 'series' + Math.min(i, 6) + '-line series-line');

      trendLine.selectAll('rect')
          .data(data[i])
        .enter().append('rect')
          .attr('width', pointWidth)
          .attr('height', pointWidth)
          .attr('x', function(d: any) {return xTimeScale(d[0]) - (pointWidth / 2); })
          .attr('y', function(d: any) {return yScale(d[1]) - (pointWidth / 2); })
          .attr('class', 'series' + Math.min(i, 6) + '-point series-point')
          .on('mouseover', function(d: any) {
            let minTip = d3.select(this.parentNode.parentNode)
              .append('g')
                .attr('class', 'value-tooltip tooltip-unlocked');
            let maxTip = d3.select(this.parentNode.parentNode)
              .append('g')
                .attr('class', 'value-tooltip tooltip-unlocked');
            let tooltip = d3.select(this.parentNode.parentNode)
              .append('g')
                .attr('class', 'value-tooltip tooltip-unlocked');
            minTip.append('rect')
              .attr('x', 0)
              .attr('y', yScale(0) - tooltipHeight / 2)
              .attr('width', tooltipWidth)
              .attr('height', tooltipHeight)
              .attr('rx', tooltipHeight / 4)
              .attr('ry', tooltipHeight / 4);
            maxTip.append('rect')
              .attr('x', 0)
              .attr('y', yScale(900) - tooltipHeight / 2)
              .attr('width', tooltipWidth)
              .attr('height', tooltipHeight)
              .attr('rx', tooltipHeight / 4)
              .attr('ry', tooltipHeight / 4);
            tooltip.append('rect')
              .attr('x', xTimeScale(d[0]) - (tooltipWidth / 2))
              .attr('y', yScale(d[1]) - (tooltipHeight + tooltipTailHeight))
              .attr('width', tooltipWidth)
              .attr('height', tooltipHeight)
              .attr('rx', tooltipHeight / 4)
              .attr('ry', tooltipHeight / 4);
            tooltip.append('polygon')
              .attr('points', xTimeScale(d[0]) + ',' + (yScale(d[1]) - (pointWidth / 2)) + ' ' +
                            (xTimeScale(d[0]) - 5) + ',' + (yScale(d[1]) - tooltipTailHeight - 1) + ' ' +
                            (xTimeScale(d[0]) + 5) + ',' + (yScale(d[1]) - tooltipTailHeight - 1));
            minTip.append('text')
              .attr('x', tooltipPadding)
              .attr('y', yScale(0) + tooltipPadding)
              .text(d3.select(this.parentNode).attr('refMin') + ' ' + d3.select(this.parentNode).attr('unit'));
            maxTip.append('text')
              .attr('x', tooltipPadding)
              .attr('y', yScale(900) + tooltipPadding)
              .text(d3.select(this.parentNode).attr('refMax') + ' ' + d3.select(this.parentNode).attr('unit'));
            tooltip.append('text')
              .attr('x', xTimeScale(d[0]) - (tooltipWidth / 2) + tooltipPadding)
              .attr('y', yScale(d[1]) - (tooltipHeight + tooltipTailHeight) / 2)
              .text(d[2] + ' ' + d3.select(this.parentNode).attr('unit'));
            d3.selectAll('.value-tooltip').each(function(){
              let tt = d3.select(this);
              let tooltipLabel = tt.select('text');
              let node: SVGTSpanElement = <SVGTSpanElement>tooltipLabel.node();
              let tooltipLabelWidth = node.getComputedTextLength();
              let rec = tt.select('rect')
                .attr('width', Math.max(tooltipLabelWidth + (2 * tooltipPadding), tooltipWidth / 2 + 2 * tooltipPadding) );
              let tooltipX = parseFloat(rec.attr('x'));
              if (tooltipX + tooltipLabelWidth + tooltipPadding * 2 > w ) {
                let overflow = (tooltipX + tooltipLabelWidth + tooltipPadding * 2) - w;
                rec.attr('x', tooltipX - overflow);
                tooltipLabel.attr('x', tooltipX - overflow + tooltipPadding);
              }
              let tooltipY = parseFloat(rec.attr('y'));
              if (tooltipY < 0) {
                rec.attr('y', 0);
                tooltipLabel.attr('y', parseFloat(tooltipLabel.attr('y')) - tooltipY);
              }
            });
          })
          .on('mouseout', function() {
            if (d3.select(this).attr('class').indexOf('tooltip-locked') === -1) {
              d3.select(this.parentNode.parentNode)
                .selectAll('.tooltip-unlocked')
                .remove();
            }
            d3.select('#highlighted').attr('id', null);
          })
          .on('click', function(d: any){
            let pts = xTimeScale(d[0]) + ',' + (yScale(d[1]) - (pointWidth / 2)) + ' ' +
                    (xTimeScale(d[0]) - 5) + ',' + (yScale(d[1]) - tooltipTailHeight - 1) + ' ' +
                    (xTimeScale(d[0]) + 5) + ',' + (yScale(d[1]) - tooltipTailHeight - 1);
            let tail = d3.select(this.parentNode.parentNode).selectAll('polygon[points="' + pts + '"]');
            if (tail.node() === null) { return; }
            let tailNode: any;
            tailNode = tail.node();
            let tt = d3.select(tailNode.parentNode);
            let ttclass = tt.attr('class');
            if (ttclass.indexOf('tooltip-locked') !== -1) {
              tt.remove();
            } else {
              tt.attr('class', ttclass.replace('tooltip-unlocked', 'tooltip-locked'));
            }
          });
          }
    }
    // legend finish
    let legendWidth = labelX - legendPadding;
    let desiredLegendWidth = w - padding * 2;
    if (legendWidth > desiredLegendWidth) {
      let legendRatio = desiredLegendWidth / legendWidth;
      legend.selectAll('text').each(function(){
        let select = d3.select(this);
        let selectX = parseFloat(select.attr('x'));
        let node: SVGTSpanElement = <SVGTSpanElement>select.node();
        let selectLength = node.getComputedTextLength();
        select.attr('textLength', selectLength * legendRatio);
        select.attr('lengthAdjust', 'spacingAndGlyphs');
        select.attr('x', selectX * legendRatio + padding * (1 - legendRatio));
      });
      legend.selectAll('rect').each(function(){
        let select = d3.select(this);
        let selectX = parseFloat(select.attr('x'));
        select.attr('x', selectX * legendRatio + padding * (1 - legendRatio));
      });
      legend.selectAll('line').each(function(){
        let select = d3.select(this);
        let selectX1 = parseFloat(select.attr('x1'));
        let selectX2 = parseFloat(select.attr('x2'));
        select.attr('x1', (selectX1) * legendRatio + padding * (1 - legendRatio));
        select.attr('x2', (selectX1 + (selectX2 - selectX1)) * legendRatio + padding * (1 - legendRatio));
      });
      legendBack.attr('width', desiredLegendWidth);
    } else {
      legendBack.attr('width', legendWidth);
    }
  }
}
