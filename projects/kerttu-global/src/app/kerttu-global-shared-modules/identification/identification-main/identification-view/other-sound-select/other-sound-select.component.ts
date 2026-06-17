import { map } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { KerttuGlobalApi } from '../../../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../../../laji/src/app/shared/service/user.service';
import { Species, TaxonTypeEnum } from '../../../../../kerttu-global-shared/models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'bsg-other-sound-select',
  templateUrl: './other-sound-select.component.html',
  styleUrls: ['./other-sound-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class OtherSoundSelectComponent implements OnChanges {
  @Input() taxonTypes?: TaxonTypeEnum[];

  selectedId?: number;
  options?: Species[];

  private allOptions?: Species[];

  @Output() soundSelect = new EventEmitter<Species>();

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.getOptions$().subscribe(options => {
      this.allOptions = options;
      this.options = this.getFilteredOptions(this.allOptions, this.taxonTypes);
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxonType && this.allOptions) {
      this.options = this.getFilteredOptions(this.allOptions, this.taxonTypes);
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

  private getOptions$(): Observable<Species[]> {
    return this.kerttuGlobalApi.getSpeciesList(
      this.userService.getToken(),
      this.translate.getCurrentLang(),
      {
        taxonTypes: [TaxonTypeEnum.other],
        pageSize: 1000
      }
    ).pipe(
      map(result => (result.results))
    );
  }

  private getFilteredOptions(options: Species[], taxonTypes?: TaxonTypeEnum[]): Species[] {
    const filtered: string[] = [];
    if (!taxonTypes || taxonTypes.includes(TaxonTypeEnum.bird)) {
      filtered.push('Birds');
    }
    if (!taxonTypes || taxonTypes.includes(TaxonTypeEnum.bat)) {
      filtered.push('Bats');
    }
    if (!taxonTypes || taxonTypes.includes(TaxonTypeEnum.insect)) {
      filtered.push('Insects');
    }
    if (!taxonTypes) {
      filtered.push('Rodents');
    }

    return options.filter(option => (!filtered.includes(option.scientificName)));
  }
}
