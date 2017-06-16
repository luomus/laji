/**
 * Form list interface
 */
export interface FormListInterface {
  id: string;
  title: string;
  description: string;
  supportedLanguage: string[];
  category: string;
  collectionID: string;
  features: Form.Feature[];
}
export namespace Form {
  export enum Feature {
    NoNewNamedPlaces = <any> 'MHL.featureAddingNamedPlacesNotAllowed',
    NamedPlace = <any> 'MHL.featureNamedPlace',
    NoPrivate = <any> 'MHL.featureNoPrivate',
    Reserve = <any> 'MHL.featureReserve',
    Restricted = <any> 'MHL.featureRestrictAccess'
  }
}
