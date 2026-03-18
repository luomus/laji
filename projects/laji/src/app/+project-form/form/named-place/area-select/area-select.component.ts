import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AreaService } from '../../../../shared/service/area.service';
import { CollectionService } from '../../../../shared/service/collection.service';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'laji-area-select',
    templateUrl: './area-select.component.html',
    styleUrls: ['./area-select.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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
    this.lang = this.translate.getCurrentLang();
    this.initOptions();
  }

  private initOptions() {
    if (!this.field) {
      return;
    }
    this.getDataObservable()
      .subscribe(data => {
        const options: { id: string; value: string; translate?: boolean }[] = [];
        if (!this.multiselect && this.selectOptionEnabled) {
          options.push({id: undefined as any, value: 'select', translate: true});
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

  private getDataObservable(): Observable<{id: string; value: string}[]> {
    switch (this.field) {
      case 'MY.collectionID':
        return this.collectionService.getAll$(this.lang, true);
      case 'ML.biogeographicalProvince':
      case 'ML.municipality':
      case 'ML.country':
      case 'ML.birdAssociationArea':
        return this.areaService.getAreaByType(this.field);
      default:
        throw new Error('Could not find mapping for ' + this.field);
    }
  }

}
