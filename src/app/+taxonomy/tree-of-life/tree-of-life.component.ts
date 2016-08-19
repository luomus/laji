import {Component, OnInit, Input, ElementRef} from '@angular/core';
import * as d3 from 'd3';
import {Taxonomy} from "../../shared/model/Taxonomy";
import {Router} from "@angular/router";

const taxonTreeUri = '/api/taxonomy/%taxonId%?maxLevel=2&selectedFields=qname%2C%20scientificName';

@Component({
  moduleId: module.id,
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

  private active:string;
  private parents:string[] = [];

  constructor(
    private element: ElementRef,
    private router:Router
  ) {
    this.htmlElement = this.element.nativeElement;
    this.host = d3.select(this.element.nativeElement);
  }

  ngOnInit() {
    this.setup();
  }

  ngOnChanges(): void {
    this.setup();
  }

  private getTaxonTreeUri(taxonId) {
    return taxonTreeUri.replace('%taxonId%', taxonId);
  }

  updateData(taxon:Taxonomy) {
    let taxonId = taxon.id;
    if (taxonId === this.active) {
      if (this.parents.length > 0) {
        taxonId = this.parents.pop();
      } else {
        taxonId = undefined;
      }
    } else {
      this.parents.push(this.active);
    }
    this.setup(taxonId);
  }

  goToTaxon(taxon:Taxonomy) {
    this.router.navigate(['/taxon/' + taxon.id]);
  }

  private setup(taxonId:string = 'MX.53761'): void {
    var diameter = 730;

    var tree = d3.layout.tree()
      .size([360, diameter / 2 - 120])
      .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    this.diagonal = d3.svg.diagonal.radial()
      .projection(function(d) { return [d.y, (d.x | 0) / 180 * Math.PI]; });

    d3.json(this.getTaxonTreeUri(taxonId), (error, root) => {
      this.active = taxonId;
      this.host.html('');
      this.svg = this.host.append("svg")
        .attr("width", diameter)
        .attr("height", diameter + 50)
        .append("g")
        .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

      if (error) throw error;

      var nodes = tree.nodes(root),
        links = tree.links(nodes);

      var link = this.svg.selectAll(".link").data(links);

      link.enter()
        .append("path")
        .attr("class", "link")
        .attr("d", this.diagonal);

      var node = this.svg.selectAll(".node").data(nodes);

      var label = node
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "rotate(" + ((d.x | 0) - 90) + ")translate(" + d.y + ")"; })

      label.append("circle")
        .attr("r", 4.5)
        .on("click", (d) => {
          this.updateData(d);
        });

      label.append("text")
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
        .text(function(d) { return d.scientificName; })
        .on("click", (d) => {
          this.goToTaxon(d)
        });
    });

    this.host.style("height", diameter - 150 + "px");
  }
}
