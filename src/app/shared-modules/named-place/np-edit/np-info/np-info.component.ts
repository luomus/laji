import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
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
import {Rights} from '../../../../+haseka/form-permission/form-permission.service';
import {Form} from '../../../../shared/model/Form';

@Component({
  selector: 'laji-np-info',
  templateUrl: './np-info.component.html',
  styleUrls: ['./np-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpInfoComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() namedPlace: NamedPlace;
  @Input() npFormData: any;
  @Input() targetForm: any;
  @Input() collectionId: string;
  @Input() editMode: boolean;
  @Input() allowEdit: boolean;
  @Input() loading: boolean;
  @Input() accessRequested: boolean;
  @Input() formRights: Rights = {
    admin: false,
    edit: false
  };

  editButtonVisible: boolean;

  @Output() onEditButtonClick = new EventEmitter();
  @Output() onUseButtonClick = new EventEmitter();
  @Output() onRequestAccessButtonClick = new EventEmitter();
  @Output() onReserveButtonClick = new EventEmitter();
  @Output() onReleaseButtonClick = new EventEmitter();

  @ViewChild('infoModal') public modal: ModalDirective;
  @ViewChild('infoBox') infoBox;

  fields: any;
  keys: any;
  values: any;

  modalIsVisible = false;
  viewIsInitialized = false;
  resizeCanOpenModal = false;
  useButton: 'nouse'|'usable'|'reservable'|'reservedByYou'|'reservedByOther'|'accessRequested';

  constructor(private userService: UserService,
              private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.updateFields();
  }

  ngAfterViewInit() {
    this.modal.onShown.subscribe(() => { this.modalIsVisible = true; this.cdRef.markForCheck(); });
    this.modal.onHidden.subscribe(() => { this.modalIsVisible = false; this.cdRef.markForCheck(); });
    if (this.infoBox.nativeElement.offsetParent === null) {
      this.modal.show();
    }
    this.viewIsInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['namedPlace'] && !changes['namedPlace'].firstChange) {
      this.updateFields();
      this.updateButtons();
    }
    if (changes['accessRequested']) {
      this.updateButtons();
    }
  }

  npClick() {
    if (this.viewIsInitialized && this.infoBox.nativeElement.offsetParent === null) {
      this.modal.show();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.infoBox.nativeElement.offsetParent !== null) {
      if (this.modalIsVisible) {
        this.modal.hide();
      }
      this.resizeCanOpenModal = true;
    } else if (this.viewIsInitialized && this.resizeCanOpenModal) {
      this.resizeCanOpenModal = false;
      this.modal.show();
    }
  }

  editClick() {
    this.onEditButtonClick.emit();
  }

  useClick() {
    this.onUseButtonClick.emit();
  }

  private updateButtons() {
    if (!this.namedPlace) {
      return;
    }
    this.userService.getUser().subscribe(person => {
      this.editButtonVisible = (this.namedPlace.owners && this.namedPlace.owners.indexOf(person.id) !== -1);
      let btnStatus;
      if (!this.formRights.edit) {
        btnStatus = this.accessRequested ? 'accessRequested' : 'nouse';
      } else if (
        this.targetForm &&
        Array.isArray(this.targetForm.features) &&
        this.targetForm.features.indexOf(Form.Feature.Reserve) > -1
      ) {
        if (!this.namedPlace.reserve || new Date() > new Date(this.namedPlace.reserve.until)) {
          btnStatus = 'reservable';
        } else if (this.namedPlace.reserve.reserver === person.id) {
          btnStatus = 'reservedByYou';
        } else {
          btnStatus = 'reservedByOther';
        }
      } else {
        btnStatus = (
          this.namedPlace.public ||
          (this.namedPlace.owners && this.namedPlace.owners.indexOf(person.id) !== -1) ||
          (this.namedPlace.editors && this.namedPlace.editors.indexOf(person.id) !== -1)
        ) ? 'usable' : (this.accessRequested ? 'accessRequested' : 'nouse');
      }
      this.useButton = btnStatus;
      this.cdRef.markForCheck();
    });
  }

  private updateFields() {
    this.keys = [];
    this.values = {};
    this.fields = this.npFormData.schema.properties.namedPlace.items.properties;

    const displayedById =
      this.npFormData.uiSchema.namedPlace.uiSchema.items.placeWrapper['ui:options'].fieldScopes.collectionID;
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
}
