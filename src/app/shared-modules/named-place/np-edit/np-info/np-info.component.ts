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
import { RouterChildrenEventService } from '../../../own-submissions/service/router-children-event.service';
import { Document } from '../../../../shared/model/Document';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Util } from '../../../../shared/service/util.service';
import { schemaJSONPointer } from 'laji-form/lib/utils';

@Component({
  selector: 'laji-np-info',
  templateUrl: './np-info.component.html',
  styleUrls: ['./np-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpInfoComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() namedPlace: NamedPlace;
  @Input() placeForm: any;
  @Input() documentForm: any;
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

  @Output() editButtonClick = new EventEmitter();
  @Output() useButtonClick = new EventEmitter();
  @Output() reserveButtonClick = new EventEmitter();
  @Output() releaseButtonClick = new EventEmitter();

  @ViewChild('infoModal') public modal: ModalDirective;
  @ViewChild('infoBox') infoBox;
  @ViewChild('documentModal') public documentModal: ModalDirective;

  publicity = Document.PublicityRestrictionsEnum;

  listItems: NpInfoRow[] = [];

  modalIsVisible = false;
  viewIsInitialized = false;
  resizeCanOpenModal = false;
  useButton: 'nouse'|'usable'|'reservable'|'reservedByYou'|'reservedByOther';
  formReservable = false;
  useLocalDocumentViewer = false;
  documentModalVisible = false;

  public static getListItems(placeForm: any, np: NamedPlace, form: any): any[] {
    const {namedPlaceOptions = {}, collectionID: collectionId} = form;
    let displayed = [];
    if (namedPlaceOptions.infoFields) {
      displayed = namedPlaceOptions.infoFields || [];
    } else {
      const displayedById =
        placeForm.uiSchema['ui:options'].fieldScopes.collectionID;
      displayed = (displayedById[collectionId] || displayedById['*'] || []).fields;
    }

    const listItems = [];
    for (const field of displayed) {
      const fieldSchema = Util.parseJSONPointer(placeForm.schema, schemaJSONPointer(placeForm.schema, Util.JSONPathToJSONPointer(field)));
      if (!fieldSchema) {
        continue;
      }

      let value;
      const _value = Util.parseJSONPath(np, field);
      console.log(np, field, _value);
      if (!isEmpty(_value)) {
        value = _value;
      }

      let pipe;
      if (field === 'taxonIDs') {
        pipe = 'label';
      } else if (field === 'municipality') {
        pipe = 'area';
      }

      if (value) {
        listItems.push({
          title: fieldSchema.title,
          value,
          pipe
        });
      }
    }
    return listItems;

    function isEmpty(value: string) {
      return value == null || value === '';
    }
  }

  constructor(private userService: UserService,
              private eventService: RouterChildrenEventService,
              private clipboardService: ClipboardService,
              private toastService: ToastrService,
              private translate: TranslateService,
              private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.updateFields();
    this.updateButtons();
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
    if (changes['accessRequested'] && !changes['accessRequested'].firstChange) {
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
    this.editButtonClick.emit();
  }

  useClick() {
    this.useButtonClick.emit();
  }

  copyLink() {
    this.clipboardService.copyFromContent(document.location.href);
    this.toastService.success(this.translate.instant('np.copyAddress.success'));
  }

  private updateButtons() {
    if (!this.namedPlace) {
      return;
    }
    this.userService.getUser().subscribe(person => {
      this.editButtonVisible = (this.namedPlace.owners && this.namedPlace.owners.indexOf(person.id) !== -1) || this.formRights.admin;
      this.formReservable = this.documentForm &&
        Array.isArray(this.documentForm.features) &&
        this.documentForm.features.indexOf(Form.Feature.Reserve) > -1;
      this.useLocalDocumentViewer = this.documentForm &&
        Array.isArray(this.documentForm.features) &&
        this.documentForm.features.indexOf(Form.Feature.DocumentsViewableForAll) > -1;
      let btnStatus;
      if (!this.formRights.edit) {
        btnStatus = 'nouse';
      } else if (this.formReservable) {
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
    this.listItems = NpInfoComponent.getListItems(this.placeForm, this.namedPlace, this.documentForm);
  }
}
