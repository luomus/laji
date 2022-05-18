import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AtlasApiService, AtlasGrid, AtlasGridSquare } from '../../core/atlas-api.service';
import { BreadcrumbService } from '../../core/breadcrumb.service';

interface BirdSocietyInfoData {
  grid: any[];
  societyStats: any;
};

@Component({
  templateUrl: 'bird-society-info.component.html',
  styleUrls: ['bird-society-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietyInfoComponent implements OnInit {
  atlasGrid: AtlasGrid;
  selectedDataIdx = -1;

  constructor(
    private atlasApi: AtlasApiService,
    private route: ActivatedRoute,
    private breadcrumbs: BreadcrumbService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(() => {
        // this.breadcrumbs.setBreadcrumbName(BreadcrumbId.SpeciesInfo, undefined);
        //this.loading = true;
        //this.cdr.markForCheck();
      }),
      switchMap(params => this.atlasApi.getBirdSociety(params.get('id'))),
      tap(data => {
        // const name: string = data.taxon.vernacularName[this.translate.currentLang];
        /*
        this.breadcrumbs.setBreadcrumbName(
          BreadcrumbId.SpeciesInfo,
          name.charAt(0).toUpperCase() + name.substring(1)
        );
        this.headerService.setHeaders({
          title: `${capitalize(data.taxon.vernacularName[this.translate.currentLang])} | ${this.translate.instant('ba.header.title')}`
        });
        this.loading = false;
        this.cdr.detectChanges();
 */
      })
    ).subscribe(atlasGrid => {
      this.atlasGrid = atlasGrid;
      this.cdr.markForCheck();
    });
  }

  onSelectDataIdx(idx: number) {
    if (idx > 0 && idx < this.atlasGrid.length) {
      this.selectedDataIdx = idx;
      console.log(this.atlasGrid[this.selectedDataIdx]);
      this.cdr.markForCheck();
    }
  }

  resetSelected() {
    this.selectedDataIdx = -1;
    this.cdr.markForCheck();
  }
}
