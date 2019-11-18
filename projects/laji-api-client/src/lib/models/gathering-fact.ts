/* tslint:disable */
export interface GatheringFact {
  iceCover?: 'WBC.iceCoverEnum0' | 'WBC.iceCoverEnum1' | 'WBC.iceCoverEnum2' | 'WBC.iceCoverEnum3' | 'WBC.iceCoverEnum4';

  /**
   * Non-negative integer
   */
  ACAFLAonAlder?: number;

  /**
   * Non-negative integer
   */
  ACAFLAonGround?: number;

  /**
   * Non-negative integer
   */
  ACAFLAonPine?: number;

  /**
   * Non-negative integer
   */
  ACAFLAonSpruce?: number;

  /**
   * Non-negative integer
   */
  CARSPIonAlder?: number;

  /**
   * Non-negative integer
   */
  CARSPIonBirch?: number;

  /**
   * Non-negative integer
   */
  CARSPIonGround?: number;

  /**
   * Non-negative integer
   */
  CARSPIonPine?: number;

  /**
   * Non-negative integer
   */
  CARSPIonSpruce?: number;

  /**
   * Non-negative integer
   */
  LOXIAonAlder?: number;

  /**
   * Non-negative integer
   */
  LOXIAonBirch?: number;

  /**
   * Non-negative integer
   */
  LOXIAonGround?: number;

  /**
   * Non-negative integer
   */
  LOXIAonPine?: number;

  /**
   * Non-negative integer
   */
  LOXIAonSpruce?: number;
  abundanceBOMGAR?: 'WBC.speciesAbundanceEnum0' | 'WBC.speciesAbundanceEnum1' | 'WBC.speciesAbundanceEnum2' | 'WBC.speciesAbundanceEnum3';
  abundancePINENU?: 'WBC.speciesAbundanceEnum0' | 'WBC.speciesAbundanceEnum1' | 'WBC.speciesAbundanceEnum2' | 'WBC.speciesAbundanceEnum3';
  abundanceTURPIL?: 'WBC.speciesAbundanceEnum0' | 'WBC.speciesAbundanceEnum1' | 'WBC.speciesAbundanceEnum2' | 'WBC.speciesAbundanceEnum3';
  batCollector?: 'MY.batCollectorAlone' | 'MY.batCollectorWithProjectGroupMember' | 'MY.batCollectorSomeoneElse';

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
  cloudAndRain?: 'WBC.cloudAndRainEnum0' | 'WBC.cloudAndRainEnum1' | 'WBC.cloudAndRainEnum2' | 'WBC.cloudAndRainEnum3' | 'WBC.cloudAndRainEnum4';
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

  /**
   * Non-negative integer
   */
  ACAFLAonBirch?: number;

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
  pineConesAtCensus?: 'WBC.berriesAndConesEnum0' | 'WBC.berriesAndConesEnum1' | 'WBC.berriesAndConesEnum2' | 'WBC.berriesAndConesEnum3' | 'WBC.berriesAndConesEnum4' | 'WBC.berriesAndConesEnum5' | 'WBC.berriesAndConesEnum6';

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
  snowAndIceOnTrees?: 'WBC.snowAndIceOnTreesEnum0' | 'WBC.snowAndIceOnTreesEnum1' | 'WBC.snowAndIceOnTreesEnum2' | 'WBC.snowAndIceOnTreesEnum3';
  snowCover?: 'WBC.snowCoverEnum0' | 'WBC.snowCoverEnum1' | 'WBC.snowCoverEnum2' | 'WBC.snowCoverEnum3' | 'WBC.snowCoverEnum4' | 'WBC.snowCoverEnum5' | 'WBC.snowCoverEnum6' | 'WBC.snowCoverEnum7' | 'WBC.snowCoverEnum8';
  sorbusBerriesAtCensus?: 'WBC.berriesAndConesEnum0' | 'WBC.berriesAndConesEnum1' | 'WBC.berriesAndConesEnum2' | 'WBC.berriesAndConesEnum3' | 'WBC.berriesAndConesEnum4' | 'WBC.berriesAndConesEnum5' | 'WBC.berriesAndConesEnum6';
  sorbusBerriesEarlyFall?: 'WBC.berriesAndConesEnum0' | 'WBC.berriesAndConesEnum1' | 'WBC.berriesAndConesEnum2' | 'WBC.berriesAndConesEnum3' | 'WBC.berriesAndConesEnum4' | 'WBC.berriesAndConesEnum5' | 'WBC.berriesAndConesEnum6';
  spruceConesAtCensus?: 'WBC.berriesAndConesEnum0' | 'WBC.berriesAndConesEnum1' | 'WBC.berriesAndConesEnum2' | 'WBC.berriesAndConesEnum3' | 'WBC.berriesAndConesEnum4' | 'WBC.berriesAndConesEnum5' | 'WBC.berriesAndConesEnum6';
  typeOfSnowCover?: 'WBC.typeOfSnowCoverEnum0' | 'WBC.typeOfSnowCoverEnum1' | 'WBC.typeOfSnowCoverEnum2';
  visibility?: 'WBC.visibilityEnum0' | 'WBC.visibilityEnum1' | 'WBC.visibilityEnum2' | 'WBC.visibilityEnum3' | 'WBC.visibilityEnum4';
  waterbodies?: 'WBC.waterbodiesEnum0' | 'WBC.waterbodiesEnum1' | 'WBC.waterbodiesEnum2' | 'WBC.waterbodiesEnum3' | 'WBC.waterbodiesEnum4' | 'WBC.waterbodiesEnum5';
  wayOfTravel?: 'WBC.wayOfTravelEnum0' | 'WBC.wayOfTravelEnum1' | 'WBC.wayOfTravelEnum2' | 'WBC.wayOfTravelEnum9';
  wayOfTravelNotes?: string;
  wind?: 'WBC.windEnum0' | 'WBC.windEnum1' | 'WBC.windEnum2' | 'WBC.windEnum3' | 'WBC.windEnum4';
}
