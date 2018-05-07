import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormField, VALUE_IGNORE } from '../../../model/form-field';
import { MappingService } from '../../../service/mapping.service';
import { UserService } from '../../../../../shared/service';
import { InformalTaxonGroupApi } from '../../../../../shared/api/InformalTaxonGroupApi';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-special-informal-taxon-groups',
  templateUrl: './special-informal-taxon-groups.component.html',
  styleUrls: ['./special-informal-taxon-groups.component.css']
})
export class SpecialInformalTaxonGroupsComponent implements OnInit {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Input() field: FormField;
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  informalTaxonGroups: string[];

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private mappingService: MappingService,
    private informalTaxonApi: InformalTaxonGroupApi,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.informalTaxonApi.informalTaxonGroupGetTree(this.translateService.currentLang)
      .map(results => results.results)
      .subscribe(groups => {
        const list = Array.isArray(groups) ?  MappingService.informalTaxonGroupsToList(groups) : [];
        this.informalTaxonGroups = [VALUE_IGNORE, ...list];
        this.cdr.markForCheck();
      })
  }

  valueMapped(value, to) {
    const mapping = {...this.mapping};

    if (to === undefined && mapping[value]) {
      delete mapping[value];
    } else {
      mapping[value] = to;
    }
    this.mappingChanged.emit(mapping);
  }

}
