import {
  Component,
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
import { NamedPlace } from '../../../../../shared/model/NamedPlace';
import { UserService } from '../../../../../shared/service/user.service';
import { FormPermissionService } from '../../../../../shared/service/form-permission.service';
import type { LineTransectGeometry, Options } from '@luomus/laji-map';
import { TileLayerName } from '@luomus/laji-map/lib/defs';
import { LajiMapComponent } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import { Document } from '../../../../../shared/model/Document';
import { ToastsService } from '../../../../../shared/service/toasts.service';
import equals from 'deep-equal';
import { diff, DiffNew } from 'deep-diff';
import { FormService } from '../../../../../shared/service/form.service';
import { GeometryCollection } from 'geojson';
import { NamedPlacesService } from '../../../../../shared/service/named-places.service';
import { DocumentService } from '../../../../../shared-modules/own-submissions/service/document.service';

@Component({
  selector: 'laji-accepted-document-approval',
  templateUrl: './accepted-document-approval.component.html',
  styleUrls: ['./accepted-document-approval.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcceptedDocumentApprovalComponent implements OnChanges {

  @Input() namedPlace!: NamedPlace;
  @Input() document!: Document;
  @Input() lineTransect = false;

  @Output() namedPlaceChange = new EventEmitter();

  @ViewChild(LajiMapComponent, { static: false }) lajiMap!: LajiMapComponent;

  lajiMapOptions!: Options;
  data: any;
  placesDiff: false | any = false;
  geometriesDiff: false | any = false;
  otherDiff: false | any = false;
  isAdmin = false;
  activeDocument: 'document' | 'acceptedDocument' = 'document';

  constructor(
    private userService: UserService,
    private formPermissionService: FormPermissionService,
    private namedPlacesService: NamedPlacesService,
    private toastsService: ToastsService,
    private formService: FormService,
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    this.initMapOptions();
    this.initData();
    this.initIsAdmin()
      .subscribe((data: any) => {
        this.isAdmin = this.formPermissionService.isAdmin(data.formPermission, data.user);
        this.initDocumentDiff();
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
    if (!this.isAdmin || !this.placesDiff || !this.lajiMap || !this.lajiMap.map) {
      return;
    }
    this.lajiMap.map.zoomToData({paddingInMeters: 100});
  }

  private initMapOptions() {
    const options: Options = {
      tileLayerName: TileLayerName.maastokartta,
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

  setActiveDocument(document: any) {
    this.activeDocument = document;
    if (this.lineTransect) {
      this.lajiMap.map.setLineTransect(this.getLineTransectOption(document));
    } else {
      this.lajiMap.setData(this.getDataOption(document));
    }
  }

  getLineTransectOption(documentName: 'document' | 'acceptedDocument'): Options['lineTransect'] {
    const document = documentName === 'document'
      ? this.document
      : this.namedPlace.acceptedDocument;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const geometry = {type: 'MultiLineString', coordinates: document!.gatherings?.map(item => item.geometry!.coordinates) || []} as LineTransectGeometry;
    return {feature: {type: 'Feature', properties: {}, geometry}, editable: false};
  }

  getDataOption(documentName: 'document' | 'acceptedDocument'): Options['data'] {
    const document = documentName === 'document'
      ? this.document
      : this.namedPlace.acceptedDocument;

    const geometry = {
      type: 'GeometryCollection',
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      geometries: document!.gatherings?.filter(item => item?.geometry?.type).map(item => item.geometry)
    } as GeometryCollection;
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

  checkDiff(excludeFromCopy: string[]) {
    const diffIgnoredFields = [
      ...excludeFromCopy,
      '$.collectionID',
      '$.creator',
      '$.editor',
      '$.editors',
      '$.formID',
      '$.namedPlaceID',
      '$.sourceID',
      '$.gatheringEvent.leg',
      '$.gatheringEvent.legPublic',
      '$.gatheringEvent.legUserID',
      '$.gatherings.*.geometry..type',
      '$.gatherings.*.geometry..coordinates',
      '$.gatherings.*.geometry..coordinateVerbatim',
      '$.gatherings.*.gatheringFact.lineTransectSegmentMetersEnd'
    ];

    const getGeometry = (_document: any) =>
      this.documentService.removeMeta({
        type: 'GeometryCollection',
        geometry: JSON.parse(JSON.stringify(_document)).gatherings?.map((item: any) => item.geometry) || []
      },
        ['$.geometries.*.coordinateVerbatim']
      );

    const getDiff = (_acceptedDocument: any, _document: any) => (diff(_acceptedDocument, _document) || []).reduce((_diff: any, diffObj) => {
        // Flatten object rhs (right-hand-side, or otherwise speaking the new value) to
        // the path so that we can render the simple value instead of rendering an object as value.
        const addRecursively = (rhs: any, path: any) => {
          if (typeof rhs === 'object' && !Array.isArray(rhs) && rhs !== null) {
            Object.keys(rhs).forEach(key => {
              addRecursively(rhs[key], [...path, key]);
            });
          } else if (Array.isArray(rhs)) {
            rhs.forEach((key, idx) => {
              addRecursively(rhs[idx], [...path, idx]);
            });
          } else {
            if (diffObj.kind === 'N') {
              _diff.push({...diffObj, rhs, path});
            } else {
              _diff.push(diffObj);
            }
          }
        };
        addRecursively((diffObj as DiffNew<any>).rhs, diffObj.path);
        return _diff;
      }, []).sort((a: any, b: any) => b.path.join('.').localeCompare(a.path.join('')));

    const document = this.documentService.removeMeta(this.document, diffIgnoredFields);
    const acceptedDocument = this.documentService.removeMeta(this.namedPlace.acceptedDocument || {}, diffIgnoredFields);
    const geometryDiffers = !equals(getGeometry(this.document), getGeometry((this.namedPlace.acceptedDocument || {})));
    const otherwiseDiffers = !equals(document, acceptedDocument);
    const differs = otherwiseDiffers || geometryDiffers;
    return [differs, geometryDiffers, otherwiseDiffers ? getDiff(acceptedDocument, document) : undefined];
  }

  initDocumentDiff() {
    this.formService.getForm(this.document.formID).subscribe(form => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const [differs, geometriesDiff, otherDiff] = this.checkDiff(form!.excludeFromCopy!);
      this.placesDiff = differs;
      this.geometriesDiff = geometriesDiff;
      this.otherDiff = otherDiff;
    });
  }
}
