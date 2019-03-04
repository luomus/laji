import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AreaService, AreaType } from '../../../shared/service/area.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-area-select',
  templateUrl: './area-select.component.html',
  styleUrls: ['./area-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreaSelectComponent implements OnInit {

  @Input() field: string;
  @Input() disabled = false;
  @Input() multiselect = false;
  @Input() value = [];
  @Input() selectOptionEnabled = true;
  @Input() allOptionEnabled = false;

  @Output() select = new EventEmitter<string>();

  options: {id: string, value: string, translate?: boolean}[] = [];
  lang: string;

  constructor(
    private collectionService: CollectionService,
    private areaService: AreaService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService
    ) { }

  ngOnInit() {
    this.lang = this.translate.currentLang;
    this.initOptions();
  }

  private initOptions() {
    if (!this.field) {
      return;
    }
    this.getDataObservable()
      .subscribe((data) => {
        const options = [];
        if (!this.multiselect && this.selectOptionEnabled) {
          options.push({id: undefined, value: 'select', translate: true});
        }
        if (!this.multiselect && this.allOptionEnabled) {
          options.push({id: 'all', value: 'area-select.all', translate: true});
        }
        this.options = [...options, ...data.sort((a, b) => {
          return a.value.localeCompare(b.value);
        })];

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
