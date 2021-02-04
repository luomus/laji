import { Component, Input } from '@angular/core';
import { Taxonomy } from '../../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-bold-synonym',
  templateUrl: './bold-synonym.component.html',
  styleUrls: ['./bold-synonym.component.css']
})
export class BoldSynonymComponent {

  @Input() taxa: Taxonomy[];

}
