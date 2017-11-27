import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit,
  Output
} from '@angular/core';
import { AreaService, AreaType } from '../../../shared/service/area.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'laji-area-select',
  templateUrl: './area-select.component.html',
  styleUrls: ['./area-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreaSelectComponent implements OnInit {

  @Input() field: string;
  @Input() lang: string;
  @Input() disabled = false;

  @Output() select = new EventEmitter<string>();

  options: {id: string, value: string}[] = [];

  constructor(
    private collectionService: CollectionService,
    private areaService: AreaService,
    private cd: ChangeDetectorRef
    ) { }

  ngOnInit() {
    this.initOptions();
  }

  private initOptions() {
    if (!this.field) {
      return;
    }
    this.getDataObservable()
      .subscribe((data) => {
        this.options = data.sort((a, b) => {
          return a.value.localeCompare(b.value)
        });
        this.cd.markForCheck();
      });
  }

  private getDataObservable(): Observable<any> {
    switch (this.field) {
      case 'MY.collectionID':
        return this.collectionService.getAllAsLookUp(this.lang);
      case <any>AreaType.Biogeographical:
        return this.areaService.getBiogeographicalProvinces(this.lang);
      case <any>AreaType.Municipality:
        return this.areaService.getMunicipalities(this.lang);
      case <any>AreaType.Country:
        return this.areaService.getCountries(this.lang);
      case <any>AreaType.BirdAssociationArea:
        return this.areaService.getBirdAssociationAreas(this.lang);
      default:
        throw new Error('Could not find mapping for ' + this.field);
    }
  }

}
