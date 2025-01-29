import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PopstateService } from '../../../core/popstate.service';
import { AtlasTaxon } from '../../../core/atlas-api.service';

@Component({
  selector: 'ba-species-index-list',
  templateUrl: './species-index-list.component.html',
  styleUrls: ['./species-index-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesIndexListComponent implements OnInit, OnDestroy {
  @Input() atlasTaxa!: AtlasTaxon[];

  searchVal = '';
  filteredSpecies$ = new BehaviorSubject<AtlasTaxon[] | undefined>(undefined);

  private unsubscribe$ = new Subject<void>();
  private search$ = new BehaviorSubject<string>('');
  private intialized = false;

  constructor(private popstateService: PopstateService) {}

  ngOnInit(): void {
    const pathData = this.popstateService.getPathData();
    if ('searchString' in pathData) {
      this.search$.next(pathData['searchString']);
      this.searchVal = pathData['searchString'];
    }
    this.search$.pipe(
      debounceTime(200),
      takeUntil(this.unsubscribe$)
    ).subscribe(s => {
      const filterStr = s.toLowerCase();
      this.filteredSpecies$.next(
        this.atlasTaxa.filter(
          taxon => (
            taxon.vernacularName.fi + taxon.vernacularName.en + taxon.vernacularName.sv + taxon.scientificName
          ).toLowerCase().includes(filterStr)
        )
      );
      if (!this.intialized) { this.popstateService.recallScrollPosition(); this.intialized = true; }
    });
  }

  onSearchKeyUp(event: any) {
    this.search$.next(event.target.value);
  }

  ngOnDestroy() {
    this.popstateService.setPathData({ searchString: this.search$.getValue() });
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
