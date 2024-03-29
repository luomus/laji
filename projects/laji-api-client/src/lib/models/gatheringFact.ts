/* eslint-disable max-len */
/**
 * API documentation
 * Access token is needed to use this API. To get a token, send a POST request with your email address to /api-users endpoint and one will be send to your. Each endpoint bellow has more information on how to use this API. If you have any questions you can contact us at helpdesk@laji.fi.  You can find more documentation [here](https://laji.fi/about/806).  ##Endpoints  Observations and collections * Warehouse - Observation Data Warehouse API * Collection - Collection metadata * Source - Information sources (IT systems) * Annotation - Quality control   Taxonomy * Taxa - Taxonomy API * InformalTaxonGroup - Informal taxon groups are used in taxa and warehouse endpoints * Publication - Scientific publications * Checklist - Mainly you only work with one checklits: the FinBIF master checklist. There are others.   Other master data * Metadata - Variable descriptions * Area - Countries, municipalities and biogeographical provinces of Finland, etc. * Person - Information about people.   Helpers * APIUser - Register as an API user * Autocomplete - For making an autocomplete filed for taxa, collections or persons (friends) * PersonToken - Information about an authorized person   Vihko observation system * Form - Form definition * Document - Document instance of a form * Image - Image of a document   Laji.fi portal * Feedback - Feedback form API * Information - CMS content of information pages * Logger - Error logging from user's browsers to FinBIF * News - News
 *
 * OpenAPI spec version: 0.1
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


export interface GatheringFact {
  /**
   * Non-negative integer
   */
  aCAFLAonAlder?: number;
  /**
   * Non-negative integer
   */
  aCAFLAonBirch?: number;
  /**
   * Non-negative integer
   */
  aCAFLAonGround?: number;
  /**
   * Non-negative integer
   */
  aCAFLAonPine?: number;
  /**
   * Non-negative integer
   */
  aCAFLAonSpruce?: number;
  /**
   * Non-negative integer
   */
  cARSPIonAlder?: number;
  /**
   * Non-negative integer
   */
  cARSPIonBirch?: number;
  /**
   * Non-negative integer
   */
  cARSPIonGround?: number;
  /**
   * Non-negative integer
   */
  cARSPIonPine?: number;
  /**
   * Non-negative integer
   */
  cARSPIonSpruce?: number;
  /**
   * Non-negative integer
   */
  lOXIAonAlder?: number;
  /**
   * Non-negative integer
   */
  lOXIAonBirch?: number;
  /**
   * Non-negative integer
   */
  lOXIAonGround?: number;
  /**
   * Non-negative integer
   */
  lOXIAonPine?: number;
  /**
   * Non-negative integer
   */
  lOXIAonSpruce?: number;
  abundanceBOMGAR?: GatheringFact.AbundanceBOMGAREnum;
  abundancePINENU?: GatheringFact.AbundancePINENUEnum;
  abundanceTURPIL?: GatheringFact.AbundanceTURPILEnum;
  batCollector?: GatheringFact.BatCollectorEnum;
  /**
   * Non-negative integer
   */
  birdFeederCount?: number;
  /**
   * Non-negative integer
   */
  birdFeederCountBiotopeA?: number;
  /**
   * Non-negative integer
   */
  birdFeederCountBiotopeB?: number;
  /**
   * Non-negative integer
   */
  birdFeederCountBiotopeC?: number;
  /**
   * Non-negative integer
   */
  birdFeederCountBiotopeD?: number;
  /**
   * Non-negative integer
   */
  birdFeederCountBiotopeE?: number;
  /**
   * Non-negative integer
   */
  birdFeederCountBiotopeF?: number;
  /**
   * Non-negative integer
   */
  birdFeederCountBiotopeG?: number;
  /**
   * Non-negative integer
   */
  birdFeederCountBiotopeH?: number;
  cloudAndRain?: GatheringFact.CloudAndRainEnum;
  descriptionBiotopeF?: string;
  /**
   * Non-negative integer
   */
  feedingStationCount?: number;
  /**
   * Non-negative integer
   */
  feedingStationCountBiotopeA?: number;
  /**
   * Non-negative integer
   */
  feedingStationCountBiotopeB?: number;
  /**
   * Non-negative integer
   */
  feedingStationCountBiotopeC?: number;
  /**
   * Non-negative integer
   */
  feedingStationCountBiotopeD?: number;
  /**
   * Non-negative integer
   */
  feedingStationCountBiotopeE?: number;
  /**
   * Non-negative integer
   */
  feedingStationCountBiotopeF?: number;
  /**
   * Non-negative integer
   */
  feedingStationCountBiotopeG?: number;
  /**
   * Non-negative integer
   */
  feedingStationCountBiotopeH?: number;
  iceCover?: GatheringFact.IceCoverEnum;
  /**
   * Non-negative integer
   */
  invasiveControlOtherExpensesInEuros?: number;
  /**
   * Non-negative integer
   */
  invasiveControlWorkHours?: number;
  lineTransectSegmentCounted?: boolean;
  /**
   * Non-negative integer
   */
  lineTransectSegmentMetersEnd?: number;
  /**
   * Non-negative integer
   */
  lineTransectSegmentMetersStart?: number;
  meanTemperature?: number;
  observerCount?: number;
  /**
   * Non-negative integer
   */
  observerID?: number;
  pineConesAtCensus?: GatheringFact.PineConesAtCensusEnum;
  /**
   * Non-negative integer
   */
  routeID?: number;
  /**
   * Non-negative integer
   */
  routeLength?: number;
  /**
   * Non-negative integer
   */
  routeLengthBiotopeA?: number;
  /**
   * Non-negative integer
   */
  routeLengthBiotopeB?: number;
  /**
   * Non-negative integer
   */
  routeLengthBiotopeC?: number;
  /**
   * Non-negative integer
   */
  routeLengthBiotopeD?: number;
  /**
   * Non-negative integer
   */
  routeLengthBiotopeE?: number;
  /**
   * Non-negative integer
   */
  routeLengthBiotopeF?: number;
  /**
   * Non-negative integer
   */
  routeLengthBiotopeG?: number;
  /**
   * Non-negative integer
   */
  routeLengthBiotopeH?: number;
  routeLengthChange?: number;
  routeLengthChangeBiotopeA?: number;
  routeLengthChangeBiotopeB?: number;
  routeLengthChangeBiotopeC?: number;
  routeLengthChangeBiotopeD?: number;
  routeLengthChangeBiotopeE?: number;
  routeLengthChangeBiotopeF?: number;
  routeLengthChangeBiotopeG?: number;
  routeLengthChangeBiotopeH?: number;
  snowAndIceOnTrees?: GatheringFact.SnowAndIceOnTreesEnum;
  snowCover?: GatheringFact.SnowCoverEnum;
  sorbusBerriesAtCensus?: GatheringFact.SorbusBerriesAtCensusEnum;
  sorbusBerriesEarlyFall?: GatheringFact.SorbusBerriesEarlyFallEnum;
  spruceConesAtCensus?: GatheringFact.SpruceConesAtCensusEnum;
  typeOfSnowCover?: GatheringFact.TypeOfSnowCoverEnum;
  visibility?: GatheringFact.VisibilityEnum;
  waterbodies?: GatheringFact.WaterbodiesEnum;
  wayOfTravel?: GatheringFact.WayOfTravelEnum;
  wayOfTravelNotes?: string;
  wind?: GatheringFact.WindEnum;
}

export namespace GatheringFact {
  export type AbundanceBOMGAREnum =
    'WBC.speciesAbundanceEnum0'
    | 'WBC.speciesAbundanceEnum1'
    | 'WBC.speciesAbundanceEnum2'
    | 'WBC.speciesAbundanceEnum3';
  export const AbundanceBOMGAREnum = {
    SpeciesAbundanceEnum0: 'WBC.speciesAbundanceEnum0' as AbundanceBOMGAREnum,
    SpeciesAbundanceEnum1: 'WBC.speciesAbundanceEnum1' as AbundanceBOMGAREnum,
    SpeciesAbundanceEnum2: 'WBC.speciesAbundanceEnum2' as AbundanceBOMGAREnum,
    SpeciesAbundanceEnum3: 'WBC.speciesAbundanceEnum3' as AbundanceBOMGAREnum
  };
  export type AbundancePINENUEnum =
    'WBC.speciesAbundanceEnum0'
    | 'WBC.speciesAbundanceEnum1'
    | 'WBC.speciesAbundanceEnum2'
    | 'WBC.speciesAbundanceEnum3';
  export const AbundancePINENUEnum = {
    SpeciesAbundanceEnum0: 'WBC.speciesAbundanceEnum0' as AbundancePINENUEnum,
    SpeciesAbundanceEnum1: 'WBC.speciesAbundanceEnum1' as AbundancePINENUEnum,
    SpeciesAbundanceEnum2: 'WBC.speciesAbundanceEnum2' as AbundancePINENUEnum,
    SpeciesAbundanceEnum3: 'WBC.speciesAbundanceEnum3' as AbundancePINENUEnum
  };
  export type AbundanceTURPILEnum =
    'WBC.speciesAbundanceEnum0'
    | 'WBC.speciesAbundanceEnum1'
    | 'WBC.speciesAbundanceEnum2'
    | 'WBC.speciesAbundanceEnum3';
  export const AbundanceTURPILEnum = {
    SpeciesAbundanceEnum0: 'WBC.speciesAbundanceEnum0' as AbundanceTURPILEnum,
    SpeciesAbundanceEnum1: 'WBC.speciesAbundanceEnum1' as AbundanceTURPILEnum,
    SpeciesAbundanceEnum2: 'WBC.speciesAbundanceEnum2' as AbundanceTURPILEnum,
    SpeciesAbundanceEnum3: 'WBC.speciesAbundanceEnum3' as AbundanceTURPILEnum
  };
  export type BatCollectorEnum = 'MY.batCollectorAlone' | 'MY.batCollectorWithProjectGroupMember' | 'MY.batCollectorSomeoneElse';
  export const BatCollectorEnum = {
    BatCollectorAlone: 'MY.batCollectorAlone' as BatCollectorEnum,
    BatCollectorWithProjectGroupMember: 'MY.batCollectorWithProjectGroupMember' as BatCollectorEnum,
    BatCollectorSomeoneElse: 'MY.batCollectorSomeoneElse' as BatCollectorEnum
  };
  export type CloudAndRainEnum =
    'WBC.cloudAndRainEnum0'
    | 'WBC.cloudAndRainEnum1'
    | 'WBC.cloudAndRainEnum2'
    | 'WBC.cloudAndRainEnum3'
    | 'WBC.cloudAndRainEnum4';
  export const CloudAndRainEnum = {
    CloudAndRainEnum0: 'WBC.cloudAndRainEnum0' as CloudAndRainEnum,
    CloudAndRainEnum1: 'WBC.cloudAndRainEnum1' as CloudAndRainEnum,
    CloudAndRainEnum2: 'WBC.cloudAndRainEnum2' as CloudAndRainEnum,
    CloudAndRainEnum3: 'WBC.cloudAndRainEnum3' as CloudAndRainEnum,
    CloudAndRainEnum4: 'WBC.cloudAndRainEnum4' as CloudAndRainEnum
  };
  export type IceCoverEnum = 'WBC.iceCoverEnum0' | 'WBC.iceCoverEnum1' | 'WBC.iceCoverEnum2' | 'WBC.iceCoverEnum3' | 'WBC.iceCoverEnum4';
  export const IceCoverEnum = {
    IceCoverEnum0: 'WBC.iceCoverEnum0' as IceCoverEnum,
    IceCoverEnum1: 'WBC.iceCoverEnum1' as IceCoverEnum,
    IceCoverEnum2: 'WBC.iceCoverEnum2' as IceCoverEnum,
    IceCoverEnum3: 'WBC.iceCoverEnum3' as IceCoverEnum,
    IceCoverEnum4: 'WBC.iceCoverEnum4' as IceCoverEnum
  };
  export type PineConesAtCensusEnum =
    'WBC.berriesAndConesEnum0'
    | 'WBC.berriesAndConesEnum1'
    | 'WBC.berriesAndConesEnum2'
    | 'WBC.berriesAndConesEnum3'
    | 'WBC.berriesAndConesEnum4'
    | 'WBC.berriesAndConesEnum5'
    | 'WBC.berriesAndConesEnum6';
  export const PineConesAtCensusEnum = {
    BerriesAndConesEnum0: 'WBC.berriesAndConesEnum0' as PineConesAtCensusEnum,
    BerriesAndConesEnum1: 'WBC.berriesAndConesEnum1' as PineConesAtCensusEnum,
    BerriesAndConesEnum2: 'WBC.berriesAndConesEnum2' as PineConesAtCensusEnum,
    BerriesAndConesEnum3: 'WBC.berriesAndConesEnum3' as PineConesAtCensusEnum,
    BerriesAndConesEnum4: 'WBC.berriesAndConesEnum4' as PineConesAtCensusEnum,
    BerriesAndConesEnum5: 'WBC.berriesAndConesEnum5' as PineConesAtCensusEnum,
    BerriesAndConesEnum6: 'WBC.berriesAndConesEnum6' as PineConesAtCensusEnum
  };
  export type SnowAndIceOnTreesEnum =
    'WBC.snowAndIceOnTreesEnum0'
    | 'WBC.snowAndIceOnTreesEnum1'
    | 'WBC.snowAndIceOnTreesEnum2'
    | 'WBC.snowAndIceOnTreesEnum3';
  export const SnowAndIceOnTreesEnum = {
    SnowAndIceOnTreesEnum0: 'WBC.snowAndIceOnTreesEnum0' as SnowAndIceOnTreesEnum,
    SnowAndIceOnTreesEnum1: 'WBC.snowAndIceOnTreesEnum1' as SnowAndIceOnTreesEnum,
    SnowAndIceOnTreesEnum2: 'WBC.snowAndIceOnTreesEnum2' as SnowAndIceOnTreesEnum,
    SnowAndIceOnTreesEnum3: 'WBC.snowAndIceOnTreesEnum3' as SnowAndIceOnTreesEnum
  };
  export type SnowCoverEnum =
    'WBC.snowCoverEnum0'
    | 'WBC.snowCoverEnum1'
    | 'WBC.snowCoverEnum2'
    | 'WBC.snowCoverEnum3'
    | 'WBC.snowCoverEnum4'
    | 'WBC.snowCoverEnum5'
    | 'WBC.snowCoverEnum6'
    | 'WBC.snowCoverEnum7'
    | 'WBC.snowCoverEnum8';
  export const SnowCoverEnum = {
    SnowCoverEnum0: 'WBC.snowCoverEnum0' as SnowCoverEnum,
    SnowCoverEnum1: 'WBC.snowCoverEnum1' as SnowCoverEnum,
    SnowCoverEnum2: 'WBC.snowCoverEnum2' as SnowCoverEnum,
    SnowCoverEnum3: 'WBC.snowCoverEnum3' as SnowCoverEnum,
    SnowCoverEnum4: 'WBC.snowCoverEnum4' as SnowCoverEnum,
    SnowCoverEnum5: 'WBC.snowCoverEnum5' as SnowCoverEnum,
    SnowCoverEnum6: 'WBC.snowCoverEnum6' as SnowCoverEnum,
    SnowCoverEnum7: 'WBC.snowCoverEnum7' as SnowCoverEnum,
    SnowCoverEnum8: 'WBC.snowCoverEnum8' as SnowCoverEnum
  };
  export type SorbusBerriesAtCensusEnum =
    'WBC.berriesAndConesEnum0'
    | 'WBC.berriesAndConesEnum1'
    | 'WBC.berriesAndConesEnum2'
    | 'WBC.berriesAndConesEnum3'
    | 'WBC.berriesAndConesEnum4'
    | 'WBC.berriesAndConesEnum5'
    | 'WBC.berriesAndConesEnum6';
  export const SorbusBerriesAtCensusEnum = {
    BerriesAndConesEnum0: 'WBC.berriesAndConesEnum0' as SorbusBerriesAtCensusEnum,
    BerriesAndConesEnum1: 'WBC.berriesAndConesEnum1' as SorbusBerriesAtCensusEnum,
    BerriesAndConesEnum2: 'WBC.berriesAndConesEnum2' as SorbusBerriesAtCensusEnum,
    BerriesAndConesEnum3: 'WBC.berriesAndConesEnum3' as SorbusBerriesAtCensusEnum,
    BerriesAndConesEnum4: 'WBC.berriesAndConesEnum4' as SorbusBerriesAtCensusEnum,
    BerriesAndConesEnum5: 'WBC.berriesAndConesEnum5' as SorbusBerriesAtCensusEnum,
    BerriesAndConesEnum6: 'WBC.berriesAndConesEnum6' as SorbusBerriesAtCensusEnum
  };
  export type SorbusBerriesEarlyFallEnum =
    'WBC.berriesAndConesEnum0'
    | 'WBC.berriesAndConesEnum1'
    | 'WBC.berriesAndConesEnum2'
    | 'WBC.berriesAndConesEnum3'
    | 'WBC.berriesAndConesEnum4'
    | 'WBC.berriesAndConesEnum5'
    | 'WBC.berriesAndConesEnum6';
  export const SorbusBerriesEarlyFallEnum = {
    BerriesAndConesEnum0: 'WBC.berriesAndConesEnum0' as SorbusBerriesEarlyFallEnum,
    BerriesAndConesEnum1: 'WBC.berriesAndConesEnum1' as SorbusBerriesEarlyFallEnum,
    BerriesAndConesEnum2: 'WBC.berriesAndConesEnum2' as SorbusBerriesEarlyFallEnum,
    BerriesAndConesEnum3: 'WBC.berriesAndConesEnum3' as SorbusBerriesEarlyFallEnum,
    BerriesAndConesEnum4: 'WBC.berriesAndConesEnum4' as SorbusBerriesEarlyFallEnum,
    BerriesAndConesEnum5: 'WBC.berriesAndConesEnum5' as SorbusBerriesEarlyFallEnum,
    BerriesAndConesEnum6: 'WBC.berriesAndConesEnum6' as SorbusBerriesEarlyFallEnum
  };
  export type SpruceConesAtCensusEnum =
    'WBC.berriesAndConesEnum0'
    | 'WBC.berriesAndConesEnum1'
    | 'WBC.berriesAndConesEnum2'
    | 'WBC.berriesAndConesEnum3'
    | 'WBC.berriesAndConesEnum4'
    | 'WBC.berriesAndConesEnum5'
    | 'WBC.berriesAndConesEnum6';
  export const SpruceConesAtCensusEnum = {
    BerriesAndConesEnum0: 'WBC.berriesAndConesEnum0' as SpruceConesAtCensusEnum,
    BerriesAndConesEnum1: 'WBC.berriesAndConesEnum1' as SpruceConesAtCensusEnum,
    BerriesAndConesEnum2: 'WBC.berriesAndConesEnum2' as SpruceConesAtCensusEnum,
    BerriesAndConesEnum3: 'WBC.berriesAndConesEnum3' as SpruceConesAtCensusEnum,
    BerriesAndConesEnum4: 'WBC.berriesAndConesEnum4' as SpruceConesAtCensusEnum,
    BerriesAndConesEnum5: 'WBC.berriesAndConesEnum5' as SpruceConesAtCensusEnum,
    BerriesAndConesEnum6: 'WBC.berriesAndConesEnum6' as SpruceConesAtCensusEnum
  };
  export type TypeOfSnowCoverEnum = 'WBC.typeOfSnowCoverEnum0' | 'WBC.typeOfSnowCoverEnum1' | 'WBC.typeOfSnowCoverEnum2';
  export const TypeOfSnowCoverEnum = {
    TypeOfSnowCoverEnum0: 'WBC.typeOfSnowCoverEnum0' as TypeOfSnowCoverEnum,
    TypeOfSnowCoverEnum1: 'WBC.typeOfSnowCoverEnum1' as TypeOfSnowCoverEnum,
    TypeOfSnowCoverEnum2: 'WBC.typeOfSnowCoverEnum2' as TypeOfSnowCoverEnum
  };
  export type VisibilityEnum =
    'WBC.visibilityEnum0'
    | 'WBC.visibilityEnum1'
    | 'WBC.visibilityEnum2'
    | 'WBC.visibilityEnum3'
    | 'WBC.visibilityEnum4';
  export const VisibilityEnum = {
    VisibilityEnum0: 'WBC.visibilityEnum0' as VisibilityEnum,
    VisibilityEnum1: 'WBC.visibilityEnum1' as VisibilityEnum,
    VisibilityEnum2: 'WBC.visibilityEnum2' as VisibilityEnum,
    VisibilityEnum3: 'WBC.visibilityEnum3' as VisibilityEnum,
    VisibilityEnum4: 'WBC.visibilityEnum4' as VisibilityEnum
  };
  export type WaterbodiesEnum =
    'WBC.waterbodiesEnum0'
    | 'WBC.waterbodiesEnum1'
    | 'WBC.waterbodiesEnum2'
    | 'WBC.waterbodiesEnum3'
    | 'WBC.waterbodiesEnum4'
    | 'WBC.waterbodiesEnum5';
  export const WaterbodiesEnum = {
    WaterbodiesEnum0: 'WBC.waterbodiesEnum0' as WaterbodiesEnum,
    WaterbodiesEnum1: 'WBC.waterbodiesEnum1' as WaterbodiesEnum,
    WaterbodiesEnum2: 'WBC.waterbodiesEnum2' as WaterbodiesEnum,
    WaterbodiesEnum3: 'WBC.waterbodiesEnum3' as WaterbodiesEnum,
    WaterbodiesEnum4: 'WBC.waterbodiesEnum4' as WaterbodiesEnum,
    WaterbodiesEnum5: 'WBC.waterbodiesEnum5' as WaterbodiesEnum
  };
  export type WayOfTravelEnum = 'WBC.wayOfTravelEnum0' | 'WBC.wayOfTravelEnum1' | 'WBC.wayOfTravelEnum2' | 'WBC.wayOfTravelEnum9';
  export const WayOfTravelEnum = {
    WayOfTravelEnum0: 'WBC.wayOfTravelEnum0' as WayOfTravelEnum,
    WayOfTravelEnum1: 'WBC.wayOfTravelEnum1' as WayOfTravelEnum,
    WayOfTravelEnum2: 'WBC.wayOfTravelEnum2' as WayOfTravelEnum,
    WayOfTravelEnum9: 'WBC.wayOfTravelEnum9' as WayOfTravelEnum
  };
  export type WindEnum = 'WBC.windEnum0' | 'WBC.windEnum1' | 'WBC.windEnum2' | 'WBC.windEnum3' | 'WBC.windEnum4';
  export const WindEnum = {
    WindEnum0: 'WBC.windEnum0' as WindEnum,
    WindEnum1: 'WBC.windEnum1' as WindEnum,
    WindEnum2: 'WBC.windEnum2' as WindEnum,
    WindEnum3: 'WBC.windEnum3' as WindEnum,
    WindEnum4: 'WBC.windEnum4' as WindEnum
  };
}
