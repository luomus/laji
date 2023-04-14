import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { AtlasApiService, AtlasTaxon, BirdSociety, BirdSocietyTaxaResponseElem } from '../../core/atlas-api.service';
import { BreadcrumbId, BreadcrumbService } from '../../core/breadcrumb.service';
import { PopstateService } from '../../core/popstate.service';
import { VisualizationMode } from '../../shared-modules/map-utils/visualization-mode';

@Component({
  templateUrl: 'bird-society-info.component.html',
  styleUrls: ['bird-society-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietyInfoComponent implements OnInit, OnDestroy {
  birdSociety: BirdSociety;
  loading = true;
  selectedDataIdx: number;
  visualizationMode: VisualizationMode = 'activityCategory';
  taxonVisualizationId: string | undefined;
  taxonVisualization: BirdSocietyTaxaResponseElem[] | undefined;
  taxonVisualizationLoading = false;
  activityCategoryClass = {
    'MY.atlasActivityCategoryEnum0': 'limit-neutral',
    'MY.atlasActivityCategoryEnum1': 'limit-danger',
    'MY.atlasActivityCategoryEnum2': 'limit-warning',
    'MY.atlasActivityCategoryEnum3': 'limit-success',
    'MY.atlasActivityCategoryEnum4': 'limit-success',
    'MY.atlasActivityCategoryEnum5': 'limit-success'
  };
  displayModeLarge = false;

  constructor(
    private atlasApi: AtlasApiService,
    private route: ActivatedRoute,
    private breadcrumbs: BreadcrumbService,
    private cdr: ChangeDetectorRef,
    private popstateService: PopstateService
  ) {}

  ngOnInit(): void {
    const pathData = this.popstateService.getPathData();
    this.selectedDataIdx = pathData['selectedDataIdx'] ?? -1;
    this.route.paramMap.pipe(
      tap(() => {
        this.breadcrumbs.setBreadcrumbName(BreadcrumbId.BirdSocietyInfo, undefined);
        this.loading = true;
      }),
      switchMap(params => this.atlasApi.getBirdSociety(params.get('id'))),
      tap(data => {
        this.breadcrumbs.setBreadcrumbName(BreadcrumbId.BirdSocietyInfo, data.birdAssociationArea.value);
        this.loading = false;
      })
    ).subscribe(birdSociety => {
      this.birdSociety = birdSociety;
      this.cdr.markForCheck();
    });
  }

  onSelectDataIdx(idx: number) {
    if (idx >= 0 && idx < this.birdSociety.gridSquares.length) {
      this.selectedDataIdx = idx;
      this.cdr.markForCheck();
    }
  }

  resetSelected() {
    this.selectedDataIdx = -1;
    this.cdr.markForCheck();
  }

  getActivityCategoriesAsList() {
    if (!this.birdSociety?.activityCategories) { return []; }
    return Object.values(this.birdSociety.activityCategories);
  }

  getGridSquareCount(): string {
    return this.birdSociety?.gridSquares?.length + '' ?? '';
  }

  onVisualizationChange(visualization: VisualizationMode) {
    this.visualizationMode = visualization;
  }

  onTableRowClick(taxon: AtlasTaxon | null) {
    if (taxon === null) {
      this.taxonVisualizationId = undefined;
      this.taxonVisualization = undefined;
      return;
    }
    if (this.taxonVisualizationId === taxon.id) { return; }
    this.taxonVisualizationId = taxon.id;
    this.taxonVisualizationLoading = true;
    this.atlasApi.getBirdSocietyTaxa(this.birdSociety.birdAssociationArea.key, taxon.id).subscribe(r => {
      this.taxonVisualization = r;
      this.taxonVisualizationLoading = false;
      this.cdr.markForCheck();
    });
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.popstateService.setPathData({selectedDataIdx: this.selectedDataIdx});
  }
}
