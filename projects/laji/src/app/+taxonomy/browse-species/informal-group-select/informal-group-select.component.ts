import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { InformalTaxonGroupApi } from '../../../shared/api/InformalTaxonGroupApi';
import { InformalTaxonGroup } from '../../../shared/model/InformalTaxonGroup';

export interface InformalGroup extends InformalTaxonGroup {
  results: InformalTaxonGroup[];
}

@Component({
  selector: 'laji-informal-group-select',
  templateUrl: './informal-group-select.component.html',
  styleUrls: ['./informal-group-select.component.scss']
})
export class InformalGroupSelectComponent implements OnInit, OnDestroy, OnChanges {
  @Input() id: string;
  @Input() showBreadcrumb = true;
  @Input() showAll = false;
  @Output() informalGroupSelect = new EventEmitter<string>();

  public selectedInformalGroup: InformalGroup;
  public groups: Array<InformalTaxonGroup> = [];
  private subTrans: Subscription;

  constructor(
    public translate: TranslateService,
    private informalTaxonService: InformalTaxonGroupApi
  ) { }

  ngOnInit() {
    this.refreshInformalGroups();
    this.subTrans = this.translate.onLangChange.subscribe(this.refreshInformalGroups.bind(this));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.id && !changes.id.isFirstChange()) {
      this.refreshInformalGroups();
    }
  }

  ngOnDestroy() {
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
  }

  private refreshInformalGroups() {
    this.groups = [];
    this.selectedInformalGroup = null;

    if (!this.id) {
      this.informalTaxonService
        .informalTaxonGroupFindRoots(this.translate.currentLang)
        .subscribe(this.setSelectedInformalGroup.bind(this));
    } else {
      combineLatest(
        this.informalTaxonService.informalTaxonGroupGetChildren(this.id, this.translate.currentLang),
        this.informalTaxonService.informalTaxonGroupFindById(this.id, this.translate.currentLang)
      ).pipe(
        map(this.parseInformalTaxonGroup.bind(this))
      ).subscribe(this.setSelectedInformalGroup.bind(this), () => {});
      this.informalTaxonService.informalTaxonGroupGetParents(this.id, this.translate.currentLang)
        .subscribe(data => {
          this.groups = data;
        }, () => {
          this.groups = [];
        });
    }
  }

  private parseInformalTaxonGroup(data) {
    const { results } = data[0];
    const { id, name } = data[1];
    return { results, id, name };
  }

  private setSelectedInformalGroup(data: InformalGroup) {
    this.selectedInformalGroup = data;
  }
}
