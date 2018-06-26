import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IdService } from '../../shared/service/id.service';
import { FormService } from '../../shared/service/form.service';

@Component({
  selector: 'laji-edit-link',
  templateUrl: './edit-link.component.html',
  styleUrls: ['./edit-link.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditLinkComponent {

  linkLocation = '';
  _editors: string[];
  _formID: string;
  _personID: string;
  _documentID: string;
  hasEditRights = false;

  constructor(
    private formService: FormService
  ) { }

  @Input()
  set editors(editors: string[]) {
    this._editors = editors;
    this.checkEditRight();
  }

  @Input()
  set personID(personID: string) {
    this._personID = personID;
    this.checkEditRight();
  }

  @Input()
  set documentID(documentID: string) {
    this._documentID = IdService.getId(documentID);
    this.updateLink();
  }

  @Input()
  set formID(formID: string) {
    this._formID = IdService.getId(formID);
    this.updateLink();
  }

  private checkEditRight() {
    if (!this._personID || !this._editors) {
      this.hasEditRights = false;
      return;
    }
    this.hasEditRights = this._editors.indexOf(this._personID) !== -1;
    if (this.hasEditRights) {
      this.updateLink();
    }
  }

  private updateLink() {
    if (!this.hasEditRights || !this._documentID || !this._formID) {
      return;
    }
    this.linkLocation = this.formService.getEditUrlPath(this._formID, this._documentID);
  }
}
