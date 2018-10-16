import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { Rights } from '../../../../+haseka/form-permission/form-permission.service';
import { Form } from '../../../../shared/model/Form';
import { NpInfoRow } from './np-info-row/np-info-row.component';

@Component({
  selector: 'laji-np-info',
  templateUrl: './np-info.component.html',
  styleUrls: ['./np-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpInfoComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() namedPlace: NamedPlace;
  @Input() npFormData: any;
  @Input() namedPlaceOptions: any;
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
  @Output() onReserveButtonClick = new EventEmitter();
  @Output() onReleaseButtonClick = new EventEmitter();

  @ViewChild('infoModal') public modal: ModalDirective;
  @ViewChild('infoBox') infoBox;

  listItems: NpInfoRow[] = [];

  modalIsVisible = false;
  viewIsInitialized = false;
  resizeCanOpenModal = false;
  useButton: 'nouse'|'usable'|'reservable'|'reservedByYou'|'reservedByOther';

  constructor(private userService: UserService,
              private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.updateFields();
  }

  ngAfterViewInit() {
    this.modal.onShown.subscribe(() => { this.modalIsVisible = true; this.cdRef.markForCheck(); });
    this.modal.onHidden.subscribe(() => { this.modalIsVisible = false; this.cdRef.markForCheck(); });
    if (this.windowReadyForModal()) {
      this.modal.show();
    }
    this.viewIsInitialized = true;
  }

  windowReadyForModal(): boolean {
    return window.innerWidth < 1200;
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
    if (this.viewIsInitialized && this.windowReadyForModal()) {
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
        btnStatus = 'nouse';
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
        ) ? 'usable' : 'nouse';
      }
      this.useButton = btnStatus;
      this.cdRef.markForCheck();
    });
  }

  private updateFields() {
    const fields = this.npFormData.schema.properties.namedPlace.items.properties;

    let displayed = [];
    if (this.namedPlaceOptions.infoFields) {
      displayed = this.namedPlaceOptions.infoFields || [];
    } else {
      const displayedById =
        this.npFormData.uiSchema.namedPlace.uiSchema.items['ui:options'].fieldScopes.collectionID;
      displayed = (displayedById[this.collectionId] ? displayedById[this.collectionId] : displayedById['*']).fields;
    }

    let gData = null;
    const np = this.namedPlace;

    if (np.prepopulatedDocument && np.prepopulatedDocument.gatherings && np.prepopulatedDocument.gatherings.length >= 0) {
      gData = np.prepopulatedDocument.gatherings[0];
    }

    const listItems = [];
    for (const field of displayed) {
      if (!fields[field]) {
        continue;
      }

      let value = undefined;
      if (!this.isEmpty(this.namedPlace[field])) {
        value = this.namedPlace[field];
      } else if (gData && !this.isEmpty(gData[field])) {
        value = gData[field];
      }

      let label = false;
      if (field === 'taxonIDs') {
        label = true;
      }

      if (value) {
        listItems.push({
          title: fields[field].title,
          value,
          isLabel: label
        });
      }
    }
    this.listItems = listItems;
  }

  private isEmpty(value: string) {
    return value == null || value === '';
  }
}
