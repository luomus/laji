import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ISelectFields } from '../../../../../../../../src/app/shared-modules/select-fields/select-fields/select-fields.component';
import { ResultService } from '../../../../iucn-shared/service/result.service';

@Component({
  selector: 'laji-red-list-species',
  templateUrl: './red-list-species.component.html',
  styleUrls: ['./red-list-species.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListSpeciesComponent {

  private _checklist: string;

  year: string;
  @Input() species = [];
  @Input() fields: ISelectFields[] = [];

  constructor(private resultService: ResultService) { }

  @Input() set checklist(val) {
    this._checklist = val;
    this.year = this.resultService.getYearFromChecklistVersion(val);
  }

  get checklist() {
    return this._checklist;
  }

}
