import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { QualityService } from '../quality.service';
import { PagedResult } from '../../../shared/model/PagedResult';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-quality-annotation-table',
  templateUrl: './quality-annotation-table.component.html',
  styleUrls: ['./quality-annotation-table.component.css']
})
export class QualityAnnotationTableComponent implements OnInit {
  @Input() pageSize = 50;

  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  columns = [
    { prop: 'annotation.created', cellTemplate: 'date', label: 'quality.created' },
    { prop: 'annotation.annotationByPerson', cellTemplate: 'fullUser', label: 'quality.creator' },
    { prop: 'annotation', cellTemplate: 'annotation', label: 'quality.qualityLabel' },
    { prop: 'gathering.team', label: 'quality.observer' },
    { name: 'unit.species',
      prop: 'unit',
      target: '_blank',
      label: 'quality.species',
      cellTemplate: 'species',
      sortBy: 'unit.linkings.taxon.speciesName%longLang%',
      selectField: 'unit',
      aggregateBy: 'unit.linkings.taxon.speciesId,' +
      'unit.linkings.taxon.speciesNameFinnish,' +
      'unit.linkings.taxon.speciesNameEnglish,' +
      'unit.linkings.taxon.speciesNameSwedish,' +
      'unit.linkings.taxon.speciesScientificName'
    },
    { prop: 'unit.media.0', cellTemplate: 'image', label: 'quality.image' }
  ];
  loading = true;

  private fetchSub: Subscription;

  constructor(
    private qualityService: QualityService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.fetchPage(1);
  }

  setPage(pageInfo) {
    this.fetchPage(pageInfo.offset + 1)
  }

  fetchPage(page = 1) {
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }

    this.loading = true;
    this.cd.markForCheck();

    this.fetchSub = this.qualityService
      .getAnnotationList(page, this.pageSize)
      .subscribe(data => {
        this.result = data;
        this.loading = false;
        this.cd.markForCheck();
      });
  }
}
