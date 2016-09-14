import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {Subscription} from "rxjs";

import {FormControl} from "@angular/forms";
import {AutocompleteApi} from "../api/AutocompleteApi";
import {TaxonomyApi} from "../api/TaxonomyApi";
import {Taxonomy} from "../model/Taxonomy";

@Component({
  selector: 'laji-omni-search',
  templateUrl: 'omni-search.component.html',
  styleUrls: ['./omni-search.component.css' ]
})
export class OmniSearchComponent implements OnInit, OnChanges {

  @Input() placeholder:string;
  @Input() lang:string;
  @Input() limit:number = 10;
  @Input() delay:number = 200;
  public search = '';
  public searchControl = new FormControl();
  public active = 0;
  public taxa = [];
  public taxon:Taxonomy;
  public loading = false;
  private subTaxa: Subscription;
  private subTaxon: Subscription;

  constructor(
    private autocompleteService:AutocompleteApi,
    private taxonService:TaxonomyApi
  ) {
  }

  ngOnInit() {
    const inputStream = this.searchControl.valueChanges
      .debounceTime(this.delay)
      .distinctUntilChanged();
    inputStream.subscribe( value => {this.search = value; this.updateTaxa()} )
  }


  ngOnChanges() {
    this.updateTaxa();
  }

  getClass() {
    if (this.taxa[this.active]) {
      try {
        return this.taxa[this.active].payload.informalTaxonGroups.reduce((p, c) => p + ' ' + c.id, '');
      } catch(e) {}
    }
    return '';
  }

  getGroups() {
    if (this.taxa[this.active]) {
      try {
        return this.taxa[this.active].payload.informalTaxonGroups.map(group => group.name).reverse();
      } catch(e) {}
    }
    return '';
  }

  getActive() {
    if (this.taxa[this.active]) {
      return this.taxa[this.active];
    }
    return null;
  }

  close() {
    this.search = '';
    this.taxa = [];
  }

  activate(index:number):void {
    if (this.taxa[index]) {
      this.active = index;
      this.taxon = undefined;
      this.subTaxon = this.taxonService
        .taxonomyFindBySubject(this.taxa[this.active].key, this.lang)
        .subscribe(data => this.taxon = data);
    }
  }

  keyEvent(e) {
    if (e.keyCode === 38) { // up
      if (this.taxa[this.active - 1]) {
        this.activate(this.active - 1);
      }
    }
    if (e.keyCode === 40) { // down
      if (this.taxa[this.active + 1]) {
        this.activate(this.active + 1);
      }
    }
  }

  private updateTaxa() {
    if (this.subTaxa) {
      this.subTaxa.unsubscribe();
    }
    if (this.subTaxon) {
      this.subTaxon.unsubscribe();
    }
    if (this.search.length < 4) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.subTaxa = this.autocompleteService
      .autocompleteFindByField('taxon',this.search,'' + this.limit, true, this.lang)
      .subscribe(
        data => {
          this.taxa = data;
          this.activate(0);
        },
        err => console.log(err),
        () => { this.loading = false }
      )
  }
}
