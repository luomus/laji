/**
 * Form interface
 */
export namespace Form {
  export enum Feature {
    NoNewNamedPlaces = <any> 'MHL.featureAddingNamedPlacesNotAllowed',
    NoEditingNamedPlaces = <any> 'MHL.featureEditingNamedPlacesNotAllowed',
    FilterNamedPlacesByMunicipality = <any> 'MHL.featureFilterNamedPlacesByMunicipality',
    FilterNamedPlacesByBirdAssociationArea = <any> 'MHL.featureFilterNamedPlacesByBirdAssociationArea',
    NamedPlace = <any> 'MHL.featureNamedPlace',
    NoPrivate = <any> 'MHL.featureNoPrivate',
    Reserve = <any> 'MHL.featureReserve',
    Restricted = <any> 'MHL.featureRestrictAccess',
    Administer = <any> 'MHL.featureAdminister'
  }
  export interface List {
    id: string;
    title: string;
    description: string;
    supportedLanguage: string[];
    category: string;
    collectionID: string;
    features: Form.Feature[];
  }
}
