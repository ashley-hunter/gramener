import {
  Component,
  ComponentInterface,
  Element,
  h,
  Host,
  Prop,
  Watch,
} from '@stencil/core';
import {
  create,
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
  SimulationNodeDatum,
} from 'd3';

@Component({
  tag: 'gramener-network-chart',
  styleUrl: 'network-chart.css',
  shadow: false,
  scoped: true,
})
export class NetworkChart implements ComponentInterface {
  /** The type of chart */
  @Prop() type: string = 'node-link';
  /** The data to display in the chart. */
  @Prop() data: NetworkChartData = { links: [], nodes: [] };
  /** Chart width in pixels. Default: 500 */
  @Prop() width: number = 500;
  /** Chart height in pixels. Default: 500 */
  @Prop() height: number = 500;
  /** If true, don't allow nodes to overlap. If set to a number, provide a padding between nodes. Default: false */
  @Prop() collide: number = 0;
  /** Default: pin */
  @Prop() dragAction: string = 'pin';
  /** Show nodes? `node="false"` hides all nodes. Default: true */
  @Prop() node: boolean = true;
  /** How strongly nodes push each other. -ve values make nodes pull each other. Default: +30 */
  @Prop() nodeCharge: number = 30;
  /** Show links? `links="false"` hides all links. Default: true */
  @Prop() link: boolean = true;
  /** TODO: document this. Default: None */
  @Prop() linkId: string = '';
  /** Show labels? `labels="false"` hides all labels. Default: true */
  @Prop() label: boolean = true;
  /** Radius of node circles in pixels. Default: 5 */
  @Prop() nodeSize: (node: SimulationNodeDatum) => number = () => 5;
  /** Color of the node circles. Default: red */
  @Prop() nodeFill: string | ((node: SimulationNodeDatum) => string) = 'red';
  /** Use 0.0 for transparent nodes, 1.0 for opaque nodes. Default: 1 */
  @Prop() nodeOpacity: number = 1;
  /** Outline color of the node circles. Default: #fff */
  @Prop() nodeStroke: string | ((node: SimulationNodeDatum) => string) = '#fff';
  /** Thickness of the node circles in pixels. Default: 1 */
  @Prop() nodeStrokeWidth: number = 1;
  /** Line color of the links. Default: #999 */
  @Prop() linkStroke: string = '#999';
  /** Thickness of the links in pixels. Default: 1 */
  @Prop() linkStrokeWidth: number = 1;
  /** Use 0.0 for transparent links, 1.0 for opaque links. Default: 0.6 */
  @Prop() linkOpacity: number = 0.6;
  /** Default distance between nodes. Default: 30 */
  @Prop() linkDistance: number = 30;
  /** Text to show in label. Default: None */
  @Prop() labelText: string | ((d: SimulationNodeDatum) => string) = '';
  /** `start` for left aligned, `end` for right-aligned, `middle` for centered. Default: middle */
  @Prop() labelTextAnchor: string = 'middle';
  /** `hanging` for top aligned, `alphabetic` for bottom-aligned,  `middle` for centered. Default: middle */
  @Prop() labelDominantBaseline: string = 'middle';
  /** Label font name, e.g. `Roboto`. Default: sans-serif */
  @Prop() labelFontFamily: string = 'sans-serif';
  /** Label font size in pixels. Default: 12 */
  @Prop() labelFontSize: number = 12;
  /** Label font weight, e.g. "bold" or "". Default: bold */
  @Prop() labelFontWeight: string = 'bold';
  /** Label font color. Default: black */
  @Prop() labelFill: string = 'black';
  /** Shift label right in pixels. -ve values to shift left. Default: 0 */
  @Prop() labelDx: number | ((d: SimulationNodeDatum) => number) = 0;
  /** Shift label down in pixels. -ve values to shift up. Default: 0 */
  @Prop() labelDy: number | ((d: SimulationNodeDatum) => number) = 0;

  /** Access the host element */
  @Element() host: HTMLElement;

  /** Store the chart instance */
  private networkChart;

  componentDidLoad(): void {
    this.renderChart();
  }

  @Watch('data')
  renderChart(): void {
    let nodes, links;
    if (this.type.match(/node.*link/i)) {
      nodes = this.data.nodes.map(node => ({ ...node }));
      links = this.data.links.map(link => ({ ...link }));
    }

    const dragBehavior = simulation =>
      drag()
        .on('start', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          if (!this.dragAction.match(/pin/i)) {
            d.fx = null;
            d.fy = null;
          } else {
            event.sourceEvent.target.classList.add('pinned');
          }
        });

    let ui = this.networkChart;
    if (!ui) {
      ui = this.networkChart = {};
      ui.simulation = forceSimulation()
        .force('charge', forceManyBody())
        .force('center', forceCenter(this.width / 2, this.height / 2));
      // collide:js="d => ..." specifies collision distance as a function
      // collide:number="20" specifies it as nodeSize + 20
      // Anything else (true, "any string") is the same as using nodeSize
      if (this.collide)
        ui.simulation.force(
          'collide',
          forceCollide(
            typeof this.collide == 'function'
              ? this.collide
              : typeof this.collide == 'number' ||
                typeof this.collide == 'string'
              ? d => this.nodeSize(d) + Number(this.collide)
              : this.nodeSize,
          ),
        );
      let svg = (ui.svg = create('svg')
        .attr('viewBox', [0, 0, this.width, this.height] as any)
        .attr('width', this.width)
        .attr('height', this.height));

      svg.append('g').classed('link', !!this.link);
      svg.append('g').classed('node', !!this.node);
      svg.append('g').classed('label', !!this.label);
      svg.on('dblclick.action', event => {
        // If a single node is double-clicked, unpin it
        if (event.target.matches('.node circle')) {
          let d: any = select(event.target).datum();
          d.fx = d.fy = null;
          event.target.classList.remove('pinned');
        }
        // Else (if the entire SVG is double-clicked) unpin all
        else {
          ui.node.each(d => (d.fx = d.fy = null));
          ui.node.classed('pinned', false);
        }
      });
      ui.simulation.on('tick', () => {
        ui.link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        ui.node.attr('cx', d => d.x).attr('cy', d => d.y);
        ui.label.attr('x', d => d.x).attr('y', d => d.y);
      });

      (this.host as any).replaceChildren(svg.node());
    }

    ui.simulation.nodes(nodes.filter(d => !d.hide));
    let forceLinks = forceLink(links).distance(this.linkDistance);
    if (this.linkId) forceLinks.id(d => d[this.linkId]);
    ui.simulation.force('link', forceLinks);
    ui.simulation.force('charge').strength(Number(this.nodeCharge));
    ui.link = ui.svg
      .select('g.link')
      .selectAll('line')
      .data(links.filter(d => !d.source.hide && !d.target.hide))
      .join('line')
      .attr('stroke', this.linkStroke)
      .attr('stroke-opacity', this.linkOpacity)
      .attr('stroke-width', this.linkStrokeWidth);
    ui.node = ui.svg
      .selectAll('g.node')
      .selectAll('circle')
      .data(nodes.filter(d => !d.hide))
      .join('circle')
      .attr('stroke', this.nodeStroke)
      .attr('stroke-width', this.nodeStrokeWidth)
      .attr('r', this.nodeSize)
      .attr('fill', this.nodeFill)
      .attr('opacity', this.nodeOpacity)
      .call(dragBehavior(ui.simulation));
    ui.label = ui.svg
      .select('g.label')
      .selectAll('text')
      .data(nodes.filter(d => !d.hide))
      .join('text')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(this.labelText)
      .attr('fill', this.labelFill)
      .attr('font-weight', this.labelFontWeight)
      .attr('font-size', this.labelFontSize)
      .attr('font-family', this.labelFontFamily)
      .attr('text-anchor', this.labelTextAnchor)
      .attr('dominant-baseline', this.labelDominantBaseline)
      .attr('dx', this.labelDx)
      .attr('dy', this.labelDy);
    ui.simulation.alpha(0.3).restart();
  }

  render() {
    return <Host />;
  }
}

export type NetworkChartData = {
  nodes: NetworkChartNode[];
  links: NetworkChartLink[];
};
export type NetworkChartNode = { id: number };
export type NetworkChartLink = { source: number; target: number };
