/* tslint:disable */
import { GatheringFact } from './gathering-fact';
import { TaxonCensus } from './taxon-census';
import { Units } from './units';
import { Geometry } from './geometry';
export interface Gatherings {
  invasiveControlEffectiveness?: 'MY.invasiveControlEffectivenessFull' | 'MY.invasiveControlEffectivenessPartial' | 'MY.invasiveControlEffectivenessNone' | 'MY.invasiveControlEffectivenessNotFound';

  /**
   * Context for the given json
   */
  '@context'?: string;

  /**
   * AFE grid name
   */
  AFEQuadrat?: string;

  /**
   * UTM grid name
   */
  UTMQuadrat?: string;

  /**
   * Separate multiple names with commas, from generic to specific. (E.g. Etelä-Suomen lääni, Uusimaa)
   */
  administrativeProvince?: string;

  /**
   * Altitude form sea level in meters, single value or range (E.g. 90, or 80-100). No GPS altitude here.
   */
  alt?: string;
  areaDetail?: string;

  /**
   * Write associated taxa names here, separated by a semicolon (;). E.g.: \"Betula pendula; Betula pubescens; Poaceae\".
   */
  associatedObservationTaxa?: string;
  associatedSpecimenTaxa?: string;

  /**
   * Bat habitat
   */
  batHabitat?: Array<string>;

  /**
   * Formal abbreviation. For Finnish eliömaakunnat, use Finnish abbreviation.
   */
  biologicalProvince?: string;

  /**
   * Name of an expedition or such.
   */
  collectingEventName?: string;
  controlActivitiesNotes?: string;

  /**
   * Free-text notes about the coordinates.
   */
  coordinateNotes?: string;

  /**
   * Maximum error of coordinates in meters
   */
  coordinateRadius?: string;

  /**
   * Use for NEW SPECIMENS: Where the coordinates have been acquired
   */
  coordinateSource?: 'MY.coordinateSourceGps' | 'MY.coordinateSourcePeruskartta' | 'MY.coordinateSourcePapermap' | 'MY.coordinateSourceKotkamap' | 'MY.coordinateSourceKarttapaikka' | 'MY.coordinateSourceRetkikartta' | 'MY.coordinateSourceGoogle' | 'MY.coordinateSourceOther' | 'MY.coordinateSourceUnknown';

  /**
   * More information about the coordinate systems: https://wiki.helsinki.fi/display/digit/Entering+specimen+data
   */
  coordinateSystem?: 'MY.coordinateSystemYkj' | 'MY.coordinateSystemWgs84' | 'MY.coordinateSystemWgs84dms' | 'MY.coordinateSystemKkj' | 'MY.coordinateSystemEtrs-tm35fin' | 'MY.coordinateSystemDd' | 'MY.coordinateSystemDms';
  coordinatesGridYKJ?: string;

  /**
   * Coordinates and possible coordinate system word-to-word as they appear on the label or other original source, errors and all.
   */
  coordinatesVerbatim?: string;

  /**
   * Country name in English, or 2-letter country code, or name from label
   */
  country?: string;

  /**
   * County (piirikunta, kreivikunta etc.)
   */
  county?: string;
  dateBegin?: string;
  dateEnd?: string;

  /**
   * Date just as it appears on the label or other original source, no interpretation, errors and all
   */
  dateVerbatim?: string;

  /**
   * Depth in meters, single value or range (E.g. 0.9, or 0.8-1.0)
   */
  depth?: string;
  dynamicProperties?: string;
  eventDate?: string;
  forestVegetationZone?: 'MY.forestVegetationZone1a' | 'MY.forestVegetationZone1b' | 'MY.forestVegetationZone2a' | 'MY.forestVegetationZone2b' | 'MY.forestVegetationZone3a' | 'MY.forestVegetationZone3b' | 'MY.forestVegetationZone3c' | 'MY.forestVegetationZone4a' | 'MY.forestVegetationZone4b' | 'MY.forestVegetationZone4c' | 'MY.forestVegetationZone4d';

  /**
   * instance of gatheringFact
   */
  gatheringFact?: GatheringFact;
  gatheringType?: 'MY.gatheringTypeForagingArea' | 'MY.gatheringTypeBreedingAndRestingArea' | 'MY.gatheringTypeCavityTree' | 'MY.gatheringTypeDroppingsTree' | 'MY.gatheringTypeNestTree';

  /**
   * QName for MZ.geometry
   */
  geometry?: string;

  /**
   * Use for OLD SPECIMENS: What source was used to get coordinates based on locality names
   */
  georeferenceSource?: 'MY.georeferenceSourceKotka' | 'MY.georeferenceSourceKarttapaikka' | 'MY.georeferenceSourcePaikkatietoikkuna' | 'MY.georeferenceSourceKarjalankartat' | 'MY.georeferenceSourceRetkikartta' | 'MY.georeferenceSourceGoogle' | 'MY.georeferenceSourcePeruskartta' | 'MY.georeferenceSourcePapermap' | 'MY.georeferenceSourceOtherpaper' | 'MY.georeferenceSourceOtherweb' | 'MY.georeferenceSourceCatalogue' | 'MY.georeferenceSourceBiogeomancer' | 'MY.georeferenceSourceGeolocate' | 'MY.georeferenceSourceOther' | 'MY.georeferenceSourceUnknown';
  habitat?: Array<string>;
  habitatAttributes?: Array<string>;

  /**
   * Formal habitat name or abbreviation. If several, separate with semicolons (E.g. 'OMT; OMaT').
   */
  habitatClassification?: string;

  /**
   * Informal description of the habitat.
   */
  habitatDescription?: string;

  /**
   * QName for MY.unit
   */
  hasUnit?: Array<string>;

  /**
   * If country is not known or not applicable, for example continent, ocean or large island
   */
  higherGeography?: string;

  /**
   * Unique ID for the object. This will be automatically generated.
   */
  id?: string;

  /**
   * QName for MM.image
   */
  images?: Array<string>;
  invasiveControlAreaKnown?: boolean;
  invasiveControlDangerous?: boolean;
  invasiveControlDangerousDescription?: string;

  /**
   * This field is automatically populated with the objects type and any user given value in here will be ignored!
   */
  '@type'?: string;
  invasiveControlEffectivenessNotes?: string;
  invasiveControlMethods?: Array<string>;
  invasiveControlMethodsDescription?: string;
  invasiveControlOpen?: boolean;
  invasiveControlOpenDescription?: string;

  /**
   * Non-negative integer
   */
  invasiveControlOtherExpensesInEuros?: number;

  /**
   * QName for MX.taxon
   */
  invasiveControlTaxon?: Array<string>;
  keywords?: Array<string>;

  /**
   * Latitude. For southern latitudes, use negative value.
   */
  latitude?: string;

  /**
   * Name of the collector(s), in format 'Lastname, Firstname; Lastname Firstname'
   */
  leg?: Array<string>;

  /**
   * Alkuperäislähteen käyttäjätunnus
   */
  legUserID?: Array<string>;

  /**
   * Leg just as it appears in the label or other original source, no interpretation, errors and all.
   */
  legVerbatim?: string;

  /**
   * Official name of the locality. Separate multiple names with commas, from generic to specific. No informal description here!
   */
  locality?: string;

  /**
   * Informal description of the exact locality, e.g. '5 km NE of city X, under stone bridge'
   */
  localityDescription?: string;

  /**
   * An unique identifier or code for the locality, if the locality has one (e.g. from SAPO-ontology).
   */
  localityID?: string;

  /**
   * Locality word-to-word as it appears on the label or other original source, errors and all
   */
  localityVerbatim?: string;

  /**
   * Longitude. For western longitudes, use negative value.
   */
  longitude?: string;

  /**
   * Municipality, commune, town, city or civil parish
   */
  municipality?: string;

  /**
   * QName for MNP.namedPlace
   */
  namedPlaceID?: string;

  /**
   * Free-text notes
   */
  notes?: string;
  observationDays?: number;
  observationMinutes?: number;
  predominantTree?: 'MX.37819' | 'MX.37812' | 'MX.37992' | 'MX.38004' | 'MX.38590' | 'MX.38686' | 'MX.38563' | 'MX.38527' | 'MX.41344' | 'MX.38016' | 'MX.39331' | 'MX.37990' | 'MX.38008' | 'MX.38010' | 'MX.37975' | 'MX.37976' | 'MX.39122';
  projectTitle?: string;
  province?: string;

  /**
   * PUBLIC: all data can be published; PROTECTED: exact locality is hidden; PRIVATE: most of the data is hidden. If blank means same as public
   */
  publicityRestrictions?: 'MZ.publicityRestrictionsPublic' | 'MZ.publicityRestrictionsProtected' | 'MZ.publicityRestrictionsPrivate';

  /**
   * Relative humidity %. Non-negative integer
   */
  relativeHumidity?: number;
  samplingMethod?: 'MY.samplingMethodLight' | 'MY.samplingMethodLightTrap' | 'MY.samplingMethodTrap' | 'MY.samplingMethodMalaise' | 'MY.samplingMethodPitfall' | 'MY.samplingMethodWindowtrap' | 'MY.samplingMethodYellowWindowTrap' | 'MY.samplingMethodPantrap' | 'MY.samplingMethodYellowpan' | 'MY.samplingMethodYellowtrap' | 'MY.samplingMethodFeromonetrap' | 'MY.samplingMethodBaittrap' | 'MY.samplingMethodBait' | 'MY.samplingMethodNet' | 'MY.samplingMethodSweeping' | 'MY.samplingMethodCarnet' | 'MY.samplingMethodMistnet' | 'MY.samplingMethodBoard' | 'MY.samplingMethodReared' | 'MY.samplingMethodExovo' | 'MY.samplingMethodElarva' | 'MY.samplingMethodEpupa' | 'MY.samplingMethodEclectortrap' | 'MY.samplingMethodHand' | 'MY.samplingMethodSifting' | 'MY.samplingMethodSoilsample' | 'MY.samplingMethodDropping' | 'MY.samplingMethodWashing' | 'MY.samplingMethodDigging' | 'MY.samplingMethodDiving' | 'MY.samplingMethodDrag' | 'MY.samplingMethodTriangleDrag' | 'MY.samplingMethodFishNet' | 'MY.samplingMethodElectrofishing' | 'MY.samplingMethodAngleFishing' | 'MY.samplingMethodFishTrap' | 'MY.samplingMethodSeine' | 'MY.samplingMethodTrawling' | 'MY.samplingMethodBeamTrawl' | 'MY.samplingMethodOther';
  samplingMethodNotes?: string;
  skipped?: boolean;

  /**
   * Type of substrate or name of substrate species.
   */
  substrate?: string;

  /**
   * Array of taxonCensus
   */
  taxonCensus?: Array<TaxonCensus>;
  temperature?: number;
  timeEnd?: string;
  timeStart?: string;
  trapCount?: number;

  /**
   * QName for MY.unit
   */
  unit?: Array<string>;

  /**
   * Array of units
   */
  units?: Array<Units>;
  weather?: string;

  /**
   * Geological information about gathering in wgs84 format
   */
  wgs84Geometry?: Geometry;
  wgs84Latitude?: string;
  wgs84Longitude?: string;
}
