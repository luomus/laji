import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { debounce } from 'underscore';
import { Taxonomy } from '../../shared';


declare var d3: any;

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

  private _onlyFinnish: Boolean;
  private _vernacularNames: Boolean;

  private active: string;
  private parents: Array<string> = [];

  private delayedSetup;
  private taxonId: string;

  constructor(
    private element: ElementRef,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.htmlElement = this.element.nativeElement;
    this.host = d3.select(this.htmlElement);
    this.delayedSetup = debounce(this.setup, 300);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.delayedSetup(this.taxonId, this.onlyFinnish, this.vernacularNames, this.htmlElement.offsetWidth);
  }

  ngOnInit() {
    this.route.params.filter((route) => route['type'] === 'taxonomy').subscribe((route) => {
      if (route['id'] !== this.taxonId) {
        this.taxonId = route['id'];
        this.delayedSetup(this.taxonId, this.onlyFinnish, this.vernacularNames, this.htmlElement.offsetWidth);
      }
    });
    this.delayedSetup(this.taxonId, this.onlyFinnish, this.vernacularNames, this.htmlElement.offsetWidth);
  }

  @Input()
  set onlyFinnish(isOnlyFinnish: Boolean) {
    this._onlyFinnish = isOnlyFinnish;
    this.delayedSetup(this.taxonId, this.onlyFinnish, this.vernacularNames, this.htmlElement.offsetWidth);
  };

  @Input()
  set vernacularNames(isVernacularNames: Boolean) {
    this._vernacularNames = isVernacularNames;
    this.delayedSetup(this.taxonId, this.onlyFinnish, this.vernacularNames, this.htmlElement.offsetWidth);
  };

  get onlyFinnish() {
    return this._onlyFinnish;
  }

  get vernacularNames() {
    return this._vernacularNames;
  }

  private getTaxonTreeUri(taxonId: String, naks: Boolean) {
    return `/api/taxa/${taxonId}?maxLevel=2&onlyFinnish=${naks}&selectedFields=id,scientificName,vernacularName,finnishSpecies`;
  }

  private setup(taxonId: string = 'MX.53761', finnish: Boolean, vernacular: Boolean, diameter: number = 600): void {

    this.host.html('<span>...</span>');

    const tree = d3.layout.tree()
      .size([360, diameter / 2 - 120])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    this.diagonal = d3.svg.diagonal.radial()
      .projection((d) => [d.y, (d.x || 0) / 180 * Math.PI]);

    d3.json(this.getTaxonTreeUri(taxonId, finnish), (error, root) => {

      this.active = taxonId;
      this.host.html('');
      this.svg = this.host.append('svg')
        .attr('width', diameter)
        .attr('height', diameter + 40)
        .append('g')
        .attr('transform', 'translate(' + diameter / 2 + ',' + (diameter + 40) / 2 + ')');

      if (error) return;

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
        .attr('href', (d) => `/taxon/taxonomy/${d.id}`)
        .on('click', (d) => {
          this.router.navigate(['taxon', 'taxonomy', d.id]);
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
        .text((d) => vernacular ? d.vernacularName : d.scientificName);
    });

    this.host.style('height', `${diameter + 40}px`);
  }
}
