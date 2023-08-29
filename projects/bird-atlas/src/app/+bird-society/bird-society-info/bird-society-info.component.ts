import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { AtlasApiService, AtlasTaxon, BirdSociety, BirdSocietyTaxaResponseElem } from '../../core/atlas-api.service';
import { BreadcrumbId, BreadcrumbService } from '../../core/breadcrumb.service';
import { PopstateService } from '../../core/popstate.service';
import { VisualizationMode } from '../../shared-modules/map-utils/visualization-mode';
import { BirdSocietyInfoSpeciesTableComponent } from './bird-society-info-species-table/bird-society-info-species-table.component';

@Component({
  templateUrl: 'bird-society-info.component.html',
  styleUrls: ['bird-society-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietyInfoComponent implements OnInit, OnDestroy {
  @ViewChild(BirdSocietyInfoSpeciesTableComponent) table: BirdSocietyInfoSpeciesTableComponent;

  birdSociety: BirdSociety;
  loading = true;
  selectedDataIdx: number;
  visualizationMode: VisualizationMode = 'activityCategory';
  selectedTaxon: AtlasTaxon | undefined;
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

  onTaxonDeselect() {
    this.selectedTaxon = undefined;
    this.taxonVisualization = undefined;
    this.table.setSelected([]);
    this.cdr.markForCheck();
  }

  onTableRowClick(taxon: AtlasTaxon | null) {
    if (taxon === null) {
      this.selectedTaxon = undefined;
      this.taxonVisualization = undefined;
      return;
    }
    if (this.selectedTaxon?.id === taxon.id) { return; }
    this.selectedTaxon = taxon;
    this.taxonVisualizationLoading = true;
    this.atlasApi.getBirdSocietyTaxa(this.birdSociety.birdAssociationArea.key, taxon.id).subscribe(r => {
      this.taxonVisualization = r;
      this.taxonVisualizationLoading = false;
      this.cdr.markForCheck();
    });
    this.cdr.markForCheck();
  }

  onResize() {
    this.displayModeLarge = !this.displayModeLarge;
    try {
      const event = new Event('resize');
      window.dispatchEvent(event);
    } catch (error) {
      const event = window.document.createEvent('UIEvents');
      // @ts-ignore
      event.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(event);
    }
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.popstateService.setPathData({selectedDataIdx: this.selectedDataIdx});
  }
}
