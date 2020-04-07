/**
 * Form interface
 */
import { Document } from './Document';
import { Annotation } from './Annotation';
import { MultiLanguage } from '../../../../projects/laji-api-client/src/lib/models';

export namespace Form {
  export enum Feature {
    NoNewNamedPlaces = <any> 'MHL.featureAddingNamedPlacesNotAllowed',
    NoEditingNamedPlaces = <any> 'MHL.featureEditingNamedPlacesNotAllowed',
    FilterNamedPlacesByMunicipality = <any> 'MHL.featureFilterNamedPlacesByMunicipality',
    FilterNamedPlacesByBirdAssociationArea = <any> 'MHL.featureFilterNamedPlacesByBirdAssociationArea',
    FilterNamedPlacesByTags = <any> 'MHL.featureFilterNamedPlacesByTags',
    NamedPlace = <any> 'MHL.featureNamedPlace',
    NoPrivate = <any> 'MHL.featureNoPrivate',
    Reserve = <any> 'MHL.featureReserve',
    Restricted = <any> 'MHL.featureRestrictAccess',
    Administer = <any> 'MHL.featureAdminister',
    DocumentsViewableForAll = <any> 'MHL.featureDocumentsViewableForAll',
    AdminLockable = <any> 'MHL.featureAdminLockable',
    Mobile = <any> 'MHL.featureMobile',
    EditingOldWarning = <any> 'MHL.featureEditingOldDocumentWarning',
    AutoLock = <any> 'MHL.featureAutoLock',
    SecondaryCopy = <any> 'MHL.featureSecondaryCopy'
  }
  export enum PrintType {
    lineTransect = 'MHL.printTypeLineTransect',
  }
  export enum ViewerType {
    lineTransect = 'MHL.viewerTypeLineTransect',
  }
  export interface List {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    supportedLanguage: string[];
    logo?: string;
    category?: string;
    collectionID: string;
    features: Form.Feature[];
  }

  export interface IEnum {
    enum: string[];
    enumNames: string[];
  }

  export interface IAnnotationMap {
    [targetID: string]: Annotation[];
  }

  export interface IUISchemaContext {
    creator?: string;
    municipalityEnum?: IEnum;
    biogeographicalProvinceEnum?: IEnum;
    annotations?: IAnnotationMap;
    isAdmin?: boolean;
    isEdit?: boolean;
    placeholderGeometry?: any;
  }

  export interface SchemaForm extends List {
    schema: any;
    uiSchema: any;
    uiSchemaContext?: IUISchemaContext;
    instructions?: MultiLanguage;
    excludeFromCopy?: string[];
    language?: string;
    options?: {
      forms?: string;
      namedPlaceList?: string[],
      messages?: {
        success: string
      },
      season?: {
        start: string;
        end: string;
      },
      disableRequestDescription?: boolean
      editingOldWarningDuration?: string,
      ownSubmissionsColumns?: string[]
      ownSubmissionsActions?: string[]
    };
    namedPlaceOptions?: {
      description?: string;
      useLabel?: string;
      includeUnits?: boolean;
      startWithMap?: boolean;
      listLabel?: string;
      listColumnNameMapping?: {[key: string]: string};
      printLabel?: string;
      formNavLabel?: string;
      reservationUntil?: string;
      showLegendList?: boolean;
      infoFields?: string[];
      headerFields?: string[];
      documentListUseLocalDocumentViewer?: string;
      documentViewerGatheringGeometryJSONPath?: string | string[];
      documentViewerForcedFields?: string[]
    };
    prepopulatedDocument?: Document;
    printType?: PrintType;
    viewerType?: ViewerType;
    attributes?: {[key: string]: string};
    validators?: any;
    warnings?: any;
  }
}
