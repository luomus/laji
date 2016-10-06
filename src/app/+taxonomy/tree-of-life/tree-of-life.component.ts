import { Component, ElementRef, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { debounce } from 'underscore';

declare var d3: any;

const taxonTreeUri = '/api/taxonomy/%taxonId%?maxLevel=2&selectedFields=id%2CscientificName';

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
  private parents: string[] = [];

  private plop;
  private taxonId: string;

  constructor(private element: ElementRef,
              private route: ActivatedRoute,
              private router: Router,
              private location: Location) {
    this.htmlElement = this.element.nativeElement;
    this.host = d3.select(this.htmlElement);
    this.plop = debounce(() => this.setup(this.taxonId, this.htmlElement.offsetWidth), 300);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.plop();
  }

  ngOnInit() {
    this.route.params.filter((route) => route['type'] === 'taxonomy').subscribe((route) => {
      if (route['id'] === this.taxonId) {
        this.location.back();
      } else {
        this.taxonId = route['id'];
        this.setup(this.taxonId, this.htmlElement.offsetWidth);
      }
    });
    this.setup(undefined, this.htmlElement.offsetWidth);
  }

  private getTaxonTreeUri(taxonId) {
    return taxonTreeUri.replace('%taxonId%', taxonId);
  }

  private setup(taxonId: string = 'MX.53761', diameter: number = 600): void {

    let tree = d3.layout.tree()
      .size([360, diameter / 2 - 120])
      .separation(function (a, b) {
        return (a.parent === b.parent ? 1 : 2) / a.depth;
      });

    this.diagonal = d3.svg.diagonal.radial()
      .projection(function (d) {
        return [d.y, (d.x || 0) / 180 * Math.PI];
      });

    d3.json(this.getTaxonTreeUri(taxonId), (error, root) => {
      this.active = taxonId;
      this.host.html('');
      this.svg = this.host.append('svg')
        .attr('width', diameter)
        .attr('height', diameter)
        .append('g')
        .attr('transform', 'translate(' + diameter / 2 + ',' + diameter / 2 + ')');

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
        .attr('transform', function (d) {
          return 'rotate(' + ((d.x || 0) - 90) + ')translate(' + d.y + ')';
        });

      label
        .append('a')
        .attr('href', (d) => {
          return `/taxon/browse/taxonomy/${d.id}`;
        })
        .on('click', (d) => {
          this.router.navigate(['taxon', 'browse', 'taxonomy', d.id]);
          d3.event.preventDefault();
        })
        .append('circle')
        .attr('r', 5);

      label
        .append('a')
        .attr('href', (d) => {
          return `/taxon/${d.id}`;
        })
        .on('click', (d) => {
          this.router.navigate(['taxon', d.id]);
          d3.event.preventDefault();
        })
        .append('text')
        .attr('dy', '.31em')
        .attr('text-anchor', function (d) {
          return d.x < 180 ? 'start' : 'end';
        })
        .attr('transform', function (d) {
          return d.x < 180 ? 'translate(8)' : 'rotate(180)translate(-8)';
        })
        .text(function (d) {
          return d.scientificName;
        });
    });

    this.host.style('height', diameter + 'px');
  }
}
