import { ChangeDetectionStrategy, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { TaxonomyDescription } from '../../../../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-taxon-description-source',
  templateUrl: './taxon-description-source.component.html',
  styleUrls: ['./taxon-description-source.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonDescriptionSourceComponent implements OnInit {
  @Input() taxonDescription: TaxonomyDescription;

  hasTranslation: boolean;
  hasSpeciesCard: boolean;
  @Output() hasData = new EventEmitter<boolean>();


  constructor(private checklang: TranslateService) { }

  ngOnInit() {
    this.hasTranslation = (this.taxonDescription.title && this.taxonDescription.title[this.checklang.currentLang]) ? true : false;
    this.hasSpeciesCard = (this.taxonDescription.speciesCardAuthors &&
    this.taxonDescription.speciesCardAuthors[this.checklang.currentLang]) ? true : false;
    this.hasData.emit(this.hasTranslation || this.hasSpeciesCard);
  }

}
