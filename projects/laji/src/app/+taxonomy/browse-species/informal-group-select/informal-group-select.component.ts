import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

type InformalTaxonGroup = components['schemas']['store-informalTaxonGroup'];

@Component({
    selector: 'laji-informal-group-select',
    templateUrl: './informal-group-select.component.html',
    styleUrls: ['./informal-group-select.component.scss'],
    standalone: false
})
export class InformalGroupSelectComponent implements OnInit, OnDestroy, OnChanges {
  @Input() id?: string;
  @Input() showBreadcrumb = true;
  @Input() showAll = false;

  public selectedInformalGroup: InformalTaxonGroup | undefined;
  public informalGroups: InformalTaxonGroup[] = [];
  public parentGroup?: InformalTaxonGroup;

  private sub = new Subscription();

  constructor(
    public translate: TranslateService,
    private api: LajiApiClientBService
  ) { }

  ngOnInit() {
    this.refreshInformalGroups();
    this.sub.add(this.translate.onLangChange.subscribe(this.refreshInformalGroups.bind(this)));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.id && !changes.id.isFirstChange()) {
      this.refreshInformalGroups();
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private refreshInformalGroups() {
    this.parentGroup = undefined;
    this.selectedInformalGroup = undefined;

    if (!this.id) {
      this.api.get('/informal-taxon-groups/roots')
        .subscribe(data => this.informalGroups = data.results);
      return;
    }

    combineLatest(
      this.api.get('/informal-taxon-groups/{id}/children', { path: { id: this.id }}),
      this.api.get('/informal-taxon-groups/{id}', { path: { id: this.id }})
    ).subscribe(data => {
      this.informalGroups = data[0].results;
      this.selectedInformalGroup = data[1];
    });

    this.api.get('/informal-taxon-groups/{id}/parent', { path: { id: this.id }})
      .subscribe(data => this.parentGroup = data, () => {});
  }
}
