import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { UserService } from '../../../../shared/service/user.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'laji-np-info',
  templateUrl: './np-info.component.html',
  styleUrls: ['./np-info.component.css']
})
export class NpInfoComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() namedPlace: NamedPlace;
  @Input() formData: any;
  @Input() targetForm: any;
  @Input() collectionId: string;
  @Input() editMode: boolean;

  editButtonVisible: boolean;
  useButtonVisible: boolean;

  @Output() onEditButtonClick = new EventEmitter();
  @Output() onUseButtonClick = new EventEmitter();

  @ViewChild('infoModal') public modal: ModalDirective;
  @ViewChild('infoBox') infoBox;

  fields: any;
  keys: any;
  values: any;

  modalIsVisible = false;
  viewIsInitialized = false;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.updateFields();
    this.userService.getUser().subscribe(data => { this.setButtonVisibilities(data.id); });
  }

  ngAfterViewInit() {
    this.modal.onShown.subscribe(() => { this.modalIsVisible = true; });
    this.modal.onHidden.subscribe(() => { this.modalIsVisible = false; });
    if (this.infoBox.nativeElement.offsetParent === null) {
      this.modal.show();
    }
    this.viewIsInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['namedPlace']) {
      this.updateFields();
      if (this.viewIsInitialized && this.infoBox.nativeElement.offsetParent === null) {
        this.modal.show();
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.modalIsVisible && this.infoBox.nativeElement.offsetParent !== null) {
      this.modal.hide();
    }
  }

  editClick() {
    this.onEditButtonClick.emit();
  }

  useClick() {
    this.onUseButtonClick.emit();
  }

  private updateFields() {
    this.keys = [];
    this.values = {};
    this.fields = this.formData.schema.properties.namedPlace.items.properties;

    const displayedById =
      this.formData.uiSchema.namedPlace.uiSchema.items.placeWrapper['ui:options'].fieldScopes.collectionID;
    const displayed = displayedById[this.collectionId] ? displayedById[this.collectionId] : displayedById['*'];

    let gData = null;
    const np = this.namedPlace;

    if (np.prepopulatedDocument && np.prepopulatedDocument.gatherings && np.prepopulatedDocument.gatherings.length >= 0) {
      gData = np.prepopulatedDocument.gatherings[0];
    }

    for (const field in this.fields) {
      if (displayed.fields.indexOf(field) > -1 && (!this.isEmpty(this.namedPlace[field]) || (gData && !this.isEmpty(gData[field])))) {
        this.keys.push(field);
        if (!this.isEmpty(this.namedPlace[field])) {
          this.values[field] = this.namedPlace[field];
        } else {
          this.values[field] = gData[field];
        }
      }
    }
  }

  private isEmpty(value: string) {
    return value == null || value === '';
  }

  private setButtonVisibilities(userId) {
    if (this.namedPlace) {
      this.editButtonVisible = (this.namedPlace.owners && this.namedPlace.owners.indexOf(userId) !== -1);
      this.useButtonVisible = (this.namedPlace.public ||
      (this.namedPlace.owners && this.namedPlace.owners.indexOf(userId) !== -1) ||
      (this.namedPlace.editors && this.namedPlace.editors.indexOf(userId) !== -1));
    }
  }
}
