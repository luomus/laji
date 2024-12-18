import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';
import { InformalTaxonGroupApi } from '../../../shared/api/InformalTaxonGroupApi';
import { InformalTaxonGroup } from '../../../shared/model/InformalTaxonGroup';

@Component({
  selector: 'laji-informal-group-select',
  templateUrl: './informal-group-select.component.html',
  styleUrls: ['./informal-group-select.component.scss']
})
export class InformalGroupSelectComponent implements OnInit, OnDestroy, OnChanges {
  @Input() id?: string;
  @Input() showBreadcrumb = true;
  @Input() showAll = false;
  @Output() informalGroupSelect = new EventEmitter<string>();

  public selectedInformalGroup: InformalTaxonGroup | undefined;
  public informalGroups: InformalTaxonGroup[] = [];
  public parentGroup?: InformalTaxonGroup;

  private sub = new Subscription();

  constructor(
    public translate: TranslateService,
    private informalTaxonService: InformalTaxonGroupApi
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
    this.selectedInformalGroup = undefined;

    if (!this.id) {
      this.informalTaxonService.informalTaxonGroupFindRoots(this.translate.currentLang)
        .subscribe(data => this.informalGroups = data.results);
      return;
    }

    combineLatest(
      this.informalTaxonService.informalTaxonGroupGetChildren(this.id, this.translate.currentLang),
      this.informalTaxonService.informalTaxonGroupFindById(this.id, this.translate.currentLang)
    ).subscribe(data => {
      this.informalGroups = data[0].results;
      this.selectedInformalGroup = data[1];
    });

    this.informalTaxonService.informalTaxonGroupGetParent(this.id, this.translate.currentLang)
      .subscribe(data => this.parentGroup = data, () => {});
  }
}
