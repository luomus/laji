/**
 * Form interface
 */
import { Document } from './Document';
import { Annotation } from './Annotation';

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
    Mobile = <any> 'MHL.featureMobile'
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
    excludeFromCopy?: string[];
    language?: string;
    options?: {
      namedPlaceList?: string[],
      messages?: {
        success: string
      },
      season?: {
        start: string;
        end: string;
      }
    };
    namedPlaceOptions?: {
      description?: string;
      useLabel?: string;
      includeUnits?: boolean;
      startWithMap?: boolean;
      listLabel?: string;
      printLabel?: string;
      formNavLabel?: string;
      reservationUntil?: string;
      showLegendList?: boolean;
      infoFields?: string[];
    };
    prepopulatedDocument?: Document;
    printType?: PrintType;
    viewerType?: ViewerType;
    attributes?: {[key: string]: string};
    validators?: any;
    warnings?: any;
  }
}
