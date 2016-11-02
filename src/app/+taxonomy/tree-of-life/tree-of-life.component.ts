import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { debounce } from 'underscore';
import { Taxonomy } from '../../shared';


declare var d3: any;

const taxonTreeUri = '/api/taxa/%taxonId%?maxLevel=2&selectedFields=id%2CscientificName%2CvernacularName';

@Component({
  selector: 'laji-tree-of-life',
  templateUrl: 'tree-of-life.component.html',
  styleUrls: ['./tree-of-life.component.css']
})
export class TreeOfLifeComponent {

  private host;
  private width;
  private height;
  private svg;
  private tree;
  private diagonal;
  private htmlElement: HTMLElement;

  private active: string;
  private parents: Array<string> = [];

  private plop;
  private taxonId: string;

  constructor(private element: ElementRef,
              private route: ActivatedRoute,
              private router: Router) {
    this.htmlElement = this.element.nativeElement;
    this.host = d3.select(this.htmlElement);
    this.plop = debounce(this.setup, 300);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.plop(this.taxonId, this.htmlElement.offsetWidth);
  }

  ngOnInit() {
    this.route.params.filter((route) => route['type'] === 'taxonomy').subscribe((route) => {
      if (route['id'] !== this.taxonId) {
        this.taxonId = route['id'];
        this.setup(this.taxonId, this.htmlElement.offsetWidth);
      }
    });
    this.setup(undefined, this.htmlElement.offsetWidth);
  }


  @Input()
  set taxon(taxon: Taxonomy) {
    console.log(taxon);
  };

  private getTaxonTreeUri(taxonId) {
    return taxonTreeUri.replace('%taxonId%', taxonId);
  }

  private setup(taxonId: string = 'MX.53761', diameter: number = 600): void {

    const tree = d3.layout.tree()
      .size([360, diameter / 2 - 120])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    this.diagonal = d3.svg.diagonal.radial()
      .projection((d) => [d.y, (d.x || 0) / 180 * Math.PI]);

    d3.json(this.getTaxonTreeUri(taxonId), (error, root) => {
      this.active = taxonId;
      this.host.html('');
      this.svg = this.host.append('svg')
        .attr('width', diameter)
        .attr('height', diameter + 40)
        .append('g')
        .attr('transform', 'translate(' + diameter / 2 + ',' + (diameter + 40) / 2 + ')');

      if (error) throw error;

      let nodes = tree.nodes(root),
        links = tree.links(nodes);

      let link = this.svg.selectAll('.link').data(links);

      link.enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', this.diagonal);

      let node = this.svg.selectAll('.node').data(nodes);

      let label = node
        .enter().append('g')
        .attr('class', 'node')
        .attr('transform', (d) => 'rotate(' + ((d.x || 0) - 90) + ')translate(' + d.y + ')');

      label
        .append('a')
        .attr('href', (d) => `/taxon/browse/taxonomy/${d.id}`)
        .on('click', (d) => {
          this.router.navigate(['taxon', 'browse', 'taxonomy', d.id]);
          d3.event.preventDefault();
        })
        .append('circle')
        .attr('r', 5);

      label
        .append('a')
        .attr('href', (d) => `/taxon/${d.id}`)
        .on('click', (d) => {
          this.router.navigate(['taxon', d.id]);
          d3.event.preventDefault();
        })
        .append('text')
        .attr('dy', '.31em')
        .attr('text-anchor', (d) => d.x < 180 ? 'start' : 'end')
        .attr('transform', (d) => d.x < 180 ? 'translate(8)' : 'rotate(180)translate(-8)')
        .on('mouseover', function(d) {
          d3.select(this)
          .style('fill', '#1a1a1a')
          .text((data) => `${data.scientificName} ${data.vernacularName ? '- ' + data.vernacularName : ''}`);
        })
        .on('mouseout', function(d) {
          d3.select(this)
          .style('fill', 'black')
          .text((data) => data.scientificName);
        })
        .text((d) => d.scientificName);
    });

    this.host.style('height', `${diameter + 40}px`);
  }
}
