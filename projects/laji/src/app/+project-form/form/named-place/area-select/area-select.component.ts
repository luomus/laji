import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AreaService } from '../../../../shared/service/area.service';
import { CollectionService } from '../../../../shared/service/collection.service';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Area } from '../../../../shared/model/Area';

@Component({
  selector: 'laji-area-select',
  templateUrl: './area-select.component.html',
  styleUrls: ['./area-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreaSelectComponent implements OnInit {

  @Input() field: string | undefined;
  @Input() disabled = false;
  @Input() multiselect = false;
  @Input() value: string[] = [];
  @Input() selectOptionEnabled = true;
  @Input() allOptionEnabled = false;
  @Input() allOptionLast = false;
  @Input() allOptionLabel = 'area-select.all';

  @Output() areaSelect = new EventEmitter<string>();

  options: {id: string; value: string; translate?: boolean}[] = [];
  lang!: string;

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
        if (!this.allOptionLast && !this.multiselect && this.allOptionEnabled) {
          options.push({id: 'all', value: this.allOptionLabel, translate: true});
        }
        this.options = [...options, ...data.sort((a: any, b: any) => a.value.localeCompare(b.value))];
        if (this.allOptionLast && !this.multiselect && this.allOptionEnabled) {
          this.options.push({id: 'all', value: this.allOptionLabel, translate: true});
        }
        this.cd.markForCheck();
      });
  }

  private getDataObservable(): Observable<any> {
    switch (this.field) {
      case 'MY.collectionID':
        return this.collectionService.getAll$(this.lang, true);
      case <any>Area.AreaType.Biogeographical:
        return this.areaService.getBiogeographicalProvinces(this.lang);
      case <any>Area.AreaType.Municipality:
        return this.areaService.getMunicipalities(this.lang);
      case <any>Area.AreaType.Country:
        return this.areaService.getCountries(this.lang);
      case <any>Area.AreaType.BirdAssociationArea:
        return this.areaService.getBirdAssociationAreas(this.lang);
      default:
        throw new Error('Could not find mapping for ' + this.field);
    }
  }

}
