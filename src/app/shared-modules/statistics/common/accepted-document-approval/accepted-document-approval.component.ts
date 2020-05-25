import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnChanges,
  Input,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import { of as ObservableOf } from 'rxjs';
import { combineLatest, take } from 'rxjs/operators';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { UserService } from '../../../../shared/service/user.service';
import { FormPermissionService } from '../../../../+haseka/form-permission/form-permission.service';
import { LajiMapLineTransectGeometry, LajiMapOptions, LajiMapTileLayerName } from '../../../laji-map/laji-map.interface';
import { LajiMapComponent } from '../../../laji-map/laji-map.component';
import { Document } from '../../../../shared/model/Document';
import { NamedPlacesService } from '../../../named-place/named-places.service';
import { ToastsService } from '../../../../shared/service/toasts.service';
import * as equals from 'deep-equal';
import { LineTransectGeometry } from 'laji-map';
import { Geometry, GeometryCollection } from 'geojson';

@Component({
  selector: 'laji-accepted-document-approval',
  templateUrl: './accepted-document-approval.component.html',
  styleUrls: ['./accepted-document-approval.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcceptedDocumentApprovalComponent implements OnChanges {

  @Input() namedPlace: NamedPlace;
  @Input() document: Document;
  @Input() lineTransect = false;

  @Output() namedPlaceChange = new EventEmitter();

  @ViewChild(LajiMapComponent, { static: true })
  lajiMap: LajiMapComponent;
  lajiMapOptions: LajiMapOptions;
  data: any;
  placesDiff = false;
  isAdmin = false;
  activeDocument: 'document' | 'acceptedDocument' = 'document';

  constructor(
    private userService: UserService,
    private formPermissionService: FormPermissionService,
    private namedPlacesService: NamedPlacesService,
    private toastsService: ToastsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    this.initMapOptions();
    this.initData();
    this.initIsAdmin()
      .subscribe(data => {
        this.isAdmin = this.formPermissionService.isAdmin(data.formPermission, data.user);
        this.placesDiff = this.checkDiff();
        this.updateMapZoom();
        this.cdr.markForCheck();
      });
  }

  initIsAdmin() {
    if (!this.namedPlace || !this.namedPlace.collectionID) {
      return ObservableOf(null);
    }
    return this.formPermissionService.getFormPermission(this.namedPlace.collectionID, this.userService.getToken()).pipe(
      combineLatest(
        this.userService.user$.pipe(take(1)),
        (formPermission, user) => ({formPermission, user})
      ));
  }

  onMapLoad() {
    this.updateMapZoom();
  }

  updateMapZoom() {
    if (!this.isAdmin || !this.placesDiff || !this.lajiMap.map) {
      return;
    }
    // Map is hidden during initialization since admin check is done async, so we have to initialize the view manually.
    this.lajiMap.map.map.invalidateSize();
    this.lajiMap.map._initializeView();
  }

  private initMapOptions() {
    const options: LajiMapOptions = {
      tileLayerName: LajiMapTileLayerName.maastokartta,
      tileLayerOpacity: 0.5,
      zoomToData: {paddingInMeters: 100},
      controls: true
    };
    if (this.lineTransect) {
     options.lineTransect = this.getLineTransectOption(this.activeDocument);
    }
    this.lajiMapOptions = options;
  }

  private initData() {
    this.data = this.lineTransect ? undefined : this.getDataOption(this.activeDocument);
  }

  setActiveDocument(document) {
    this.activeDocument = document;
    if (this.lineTransect) {
      this.lajiMap.map.setLineTransect(this.getLineTransectOption(document));
    } else {
      this.lajiMap.setData(this.getDataOption(document));
    }
  }

  getLineTransectOption(documentName: 'document' | 'acceptedDocument'): LajiMapOptions['lineTransect'] {
    const document = documentName === 'document'
      ? this.document
      : this.namedPlace.acceptedDocument;

    const geometry = {type: 'MultiLineString', coordinates: document.gatherings?.map(item => item.geometry.coordinates) || []} as LineTransectGeometry;
    return {feature: {type: 'Feature', properties: {}, geometry}, editable: false};
  }

  getDataOption(documentName: 'document' | 'acceptedDocument'): LajiMapOptions['data'] {
    const document = documentName === 'document'
      ? this.document
      : this.namedPlace.acceptedDocument;

    const geometry: GeometryCollection = {
      type: 'GeometryCollection',
      geometries: document.gatherings?.filter(item => item.geometry.type).map(item => item.geometry) as Geometry[]
    };
    return {geoData: geometry, editable: false};
  }

  acceptNamedPlaceChanges() {
    this.namedPlacesService.updateNamedPlace(
      this.namedPlace.id,
      {...this.namedPlace, acceptedDocument: this.document},
      this.userService.getToken()
    ).subscribe((np: NamedPlace) => {
      this.namedPlaceChange.emit(np);
      this.toastsService.showSuccess(
        'Reitin päivitys onnistui. Tämän laskennan karttaa käytetään pohjana tämän reitin laskennoille jatkossa'
      );
    });
  }

  checkDiff() {
    const getGeometry = (documentName: 'document' | 'acceptedDocument') => {
      const document = documentName === 'document'
        ? this.document
        : this.namedPlace.acceptedDocument;

      return {type: 'GeometryCollection', geometry: document.gatherings?.map(item => item.geometry) || []};
    };
    return !equals(getGeometry('document'), getGeometry(('acceptedDocument')));
  }
}
