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
import { NpInfoRow } from './np-info-row/np-info-row.component';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { Form } from '../../../../shared/model/Form';
import { Document } from '../../../../shared/model/Document';
import { Rights } from '../../../../shared/service/form-permission.service';
import { Util } from '../../../../shared/service/util.service';
import { UserService } from '../../../../shared/service/user.service';
import { RowDocument } from '../../../../shared-modules/own-submissions/own-datatable/own-datatable.component';
import { Observable } from 'rxjs';
import { LajiFormUtil } from 'projects/laji/src/app/+project-form/form/laji-form/laji-form-util.service';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';

@Component({
  selector: 'laji-np-info',
  templateUrl: './np-info.component.html',
  styleUrls: ['./np-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpInfoComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() namedPlace!: NamedPlace;
  @Input() placeForm!: Form.SchemaForm;
  @Input() documentForm!: Form.SchemaForm;
  @Input() collectionId!: string;
  @Input() editMode!: boolean;
  @Input() allowEdit!: boolean;
  @Input() loading!: boolean;
  @Input() accessRequested!: boolean;
  @Input() formRights!: Rights;
  @Input() useLabel?: string;
  @Input() useDisabled = false;
  @Input() reloadSubmissions$?: Observable<void>;

  editButtonVisible: boolean | undefined;

  @Output() editButtonClick = new EventEmitter();
  @Output() deleteButtonClick = new EventEmitter();
  @Output() useButtonClick = new EventEmitter();
  @Output() reserveButtonClick = new EventEmitter();
  @Output() releaseButtonClick = new EventEmitter();

  @ViewChild('infoModal', { static: true }) public modal!: ModalComponent;
  @ViewChild('infoBox', { static: true }) infoBox!: any;

  publicity = Document.PublicityRestrictionsEnum;

  listItems: NpInfoRow[] = [];

  modalIsVisible = false;
  viewIsInitialized = false;
  resizeCanOpenModal = false;
  useButton!: 'nouse'|'usable'|'reservable'|'reservedByYou'|'reservedByOther';
  formReservable = false;
  useLocalDocumentViewer = false;
  canDelete: boolean | undefined;

  public static getSchemaFromNPJsonPathPointer(placeForm: Form.SchemaForm, docForm: Form.SchemaForm, path: string) {
    let {schema} = placeForm;
    let schemaPointer = path;
    if (path.startsWith('$.prepopulatedDocument')) {
      schema = docForm.schema;
      schemaPointer = path.replace('$.prepopulatedDocument', '$');
    }

    return Util.parseJSONPointer(
      schema,
      LajiFormUtil.schemaJSONPointer(schema, Util.JSONPathToJSONPointer(schemaPointer))
    );
  }

  public static getListItems(placeForm: any, np: NamedPlace, form: Form.SchemaForm): any[] {
    // TODO remove coupling between uiSchema and infoFields.
    let displayed = form.options?.namedPlaceOptions?.infoFields || [];
    if (!form.options?.namedPlaceOptions?.infoFields) {
      const displayedById =
        placeForm.uiSchema['ui:options'].fieldScopes.collectionID;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      displayed = (displayedById[form.collectionID!] || displayedById['*'] || []).fields;
    }
    displayed = displayed.filter((field) => field !== 'name');

    const listItems = [];
    for (const field of displayed) {
      const fieldSchema = NpInfoComponent.getSchemaFromNPJsonPathPointer(placeForm, form, field);
      if (!fieldSchema) {
        continue;
      }

      let value;
      const _value = Util.parseJSONPath(np, field);
      if (!isEmpty(_value)) {
        value = _value;
      }

      const isEnumType = fieldSchema?.type === 'string' && fieldSchema.oneOf;
      let pipe;
      if (field === 'taxonIDs' || isEnumType) {
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
              private clipboardService: ClipboardService,
              private toastService: ToastrService,
              private translate: TranslateService,
              private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.updateFields();
    this.updateButtons();
  }

  ngAfterViewInit() {
    this.modal.onShownChange.subscribe(shown => {
      this.modalIsVisible = shown;
    });
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

  hide() {
    if (this.modal.isShown) {
      this.modal.hide();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
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

  deleteClick() {
    this.deleteButtonClick.emit(this.namedPlace);
  }

  copyLink() {
    this.clipboardService.copyFromContent(document.location.href);
    this.toastService.success(this.translate.instant('np.copyAddress.success'));
  }

  private updateButtons() {
    if (!this.namedPlace) {
      return;
    }
    this.userService.user$.pipe(take(1)).subscribe(person => {
      if (!person) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.editButtonVisible = (this.namedPlace.owners && this.namedPlace.owners.indexOf(person.id!) !== -1) || this.formRights.admin;
      this.formReservable = !!this.documentForm?.options?.namedPlaceOptions?.reservationUntil;
      this.useLocalDocumentViewer = !!this.documentForm?.options?.documentsViewableForAll;
      let btnStatus: typeof this.useButton;
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
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (this.namedPlace.owners && this.namedPlace.owners.indexOf(person.id!) !== -1) ||
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (this.namedPlace.editors && this.namedPlace.editors.indexOf(person.id!) !== -1)
        ) ? 'usable' : 'nouse';
      }
      this.useButton = btnStatus;
      this.cdRef.markForCheck();
    });
  }

  onDocumentsLoaded(documents: RowDocument[]) {
    this.canDelete = !documents.length;
  }

  private updateFields() {
    this.listItems = NpInfoComponent.getListItems(this.placeForm, this.namedPlace, this.documentForm);
  }
}
