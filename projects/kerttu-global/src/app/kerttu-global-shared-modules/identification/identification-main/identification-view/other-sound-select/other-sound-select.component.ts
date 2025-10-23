import { map } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { KerttuGlobalApi } from '../../../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../../../laji/src/app/shared/service/user.service';
import { IGlobalSpecies, TaxonTypeEnum } from '../../../../../kerttu-global-shared/models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'bsg-other-sound-select',
  templateUrl: './other-sound-select.component.html',
  styleUrls: ['./other-sound-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtherSoundSelectComponent implements OnChanges {
  @Input() taxonType = TaxonTypeEnum.bird;

  selectedId?: number;
  options?: IGlobalSpecies[];

  private allOptions?: IGlobalSpecies[];

  @Output() soundSelect = new EventEmitter<IGlobalSpecies>();

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.getOptions$().subscribe(options => {
      this.allOptions = options;
      this.options = this.getFilteredOptions(this.allOptions, this.taxonType);
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxonType && this.allOptions) {
      this.options = this.getFilteredOptions(this.allOptions, this.taxonType);
    }
  }

  onSelect(selectedId?: number) {
    if (selectedId) {
      this.soundSelect.emit(this.options!.find(s => s.id === selectedId));
      setTimeout(() => {
        this.selectedId = undefined;
        this.cdr.markForCheck();
      });
    }
  }

  private getOptions$(): Observable<IGlobalSpecies[]> {
    return this.kerttuGlobalApi.getSpeciesList(
      this.userService.getToken(),
      this.translate.currentLang,
      {
        taxonType: TaxonTypeEnum.other,
        pageSize: 1000
      }
    ).pipe(
      map(result => (result.results))
    );
  }

  private getFilteredOptions(options: IGlobalSpecies[], taxonType: TaxonTypeEnum): IGlobalSpecies[] {
    return options.filter(option => (
      (taxonType === TaxonTypeEnum.bird && option.scientificName !== 'Birds') ||
      (taxonType === TaxonTypeEnum.bat && option.scientificName !== 'Bats') ||
      (taxonType === TaxonTypeEnum.insect && option.scientificName !== 'Insects')
    ));
  }
}
