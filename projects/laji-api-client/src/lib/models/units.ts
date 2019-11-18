/* tslint:disable */
import { Identifications } from './identifications';
import { Measurement } from './measurement';
import { TypeSpecimens } from './type-specimens';
import { UnitFact } from './unit-fact';
import { UnitGathering } from './unit-gathering';
export interface Units {
  lifeStage?: 'MY.lifeStageEgg' | 'MY.lifeStageLarva' | 'MY.lifeStagePupa' | 'MY.lifeStageJuvenile' | 'MY.lifeStageNymph' | 'MY.lifeStageSubimago' | 'MY.lifeStageImmature' | 'MY.lifeStageAdult' | 'MY.lifeStageFertile' | 'MY.lifeStageSterile' | 'MY.lifeStageTadpole' | 'MY.lifeStageDead' | 'MY.lifeStageAlive' | 'MY.lifeStageEmbryo' | 'MY.lifeStageSubadult' | 'MY.lifeStageMature' | 'MY.lifeStagePullus' | 'MY.lifeStageHatchedEgg' | 'MY.lifeStageHatchedPupa' | 'MY.lifeStageGall';

  /**
   * Context for the given json
   */
  '@context'?: string;

  /**
   * Diameter at breast height, in centimeters
   */
  DBH?: string;

  /**
   * Leave empty if no sample taken, or if the sample was recorded separately
   */
  DNASampleLocation?: string;
  abundanceString?: string;

  /**
   * Other identifiers this specimen has, in format 'type:identifier'. For example: 'mzhtypes:123' (old MAZ-type number)
   */
  additionalIDs?: Array<string>;
  adultIndividualCount?: number;
  age?: string;
  ageNotes?: string;
  alive?: boolean;
  ankleInMillimeters?: Array<string>;

  /**
   * Non-negative integer
   */
  areaInSquareMeters?: number;
  atlasCode?: 'MY.atlasCodeEnum1' | 'MY.atlasCodeEnum2' | 'MY.atlasCodeEnum3' | 'MY.atlasCodeEnum4' | 'MY.atlasCodeEnum5' | 'MY.atlasCodeEnum6' | 'MY.atlasCodeEnum7' | 'MY.atlasCodeEnum8' | 'MY.atlasCodeEnum61' | 'MY.atlasCodeEnum62' | 'MY.atlasCodeEnum63' | 'MY.atlasCodeEnum64' | 'MY.atlasCodeEnum65' | 'MY.atlasCodeEnum66' | 'MY.atlasCodeEnum71' | 'MY.atlasCodeEnum72' | 'MY.atlasCodeEnum73' | 'MY.atlasCodeEnum74' | 'MY.atlasCodeEnum75' | 'MY.atlasCodeEnum81' | 'MY.atlasCodeEnum82';
  batBehavior?: 'MY.batBehaviorHibernating' | 'MY.batBehaviorRoosting' | 'MY.batBehaviorHunting' | 'MY.batBehaviorDead';
  beakInMillimeters?: Array<string>;
  birdAge?: 'MY.birdAgePp' | 'MY.birdAgePm' | 'MY.birdAgeFl' | 'MY.birdAgePlus1kv' | 'MY.birdAge1Kv' | 'MY.birdAgePlus2Kv' | 'MY.birdAge2kv' | 'MY.birdAgePlus3Kv' | 'MY.birdAge3Kv' | 'MY.birdAgePlus4Kv' | 'MY.birdAge4Kv' | 'MY.birdAgePlus5Kv' | 'MY.birdAge5Kv' | 'MY.birdAgePlus6Kv' | 'MY.birdAge6Kv' | 'MY.birdAgePlus7Kv' | 'MY.birdAge7Kv' | 'MY.birdAgePlus8Kv' | 'MY.birdAge8Kv';
  birdBehavior?: Array<string>;
  birdPlumage?: 'MY.birdPlumageAd' | 'MY.birdPlumageEijp' | 'MY.birdPlumageImm' | 'MY.birdPlumageJp' | 'MY.birdPlumageJuv' | 'MY.birdPlumageNpuk' | 'MY.birdPlumagePull' | 'MY.birdPlumageSubad' | 'MY.birdPlumageTp' | 'MY.birdPlumageVp' | 'MY.birdPlumagePep' | 'MY.birdPlumageSs';
  breeding?: boolean;
  broodSize?: number;
  causeOfDeath?: string;

  /**
   * QName for MR.checklist
   */
  checklistID?: string;
  chemistry?: string;

  /**
   * Numeric or other description on the amount of individuals (or sprouts, fruiting bodies or such) in the specimen. Sexes and juveniles can be specified like so: 1m2f3j (=1 male, 2 females, 3 juveniles)
   */
  count?: string;
  decayStage?: string;
  distance?: 'MY.distanceOverFlight' | 'MY.distanceNear' | 'MY.distanceQuiteFar' | 'MY.distanceFar' | 'MY.distanceVeryFar';
  earliestEpochOrLowestSeries?: 'MY.epochOrSeriesCambrian' | 'MY.epochOrSeriesCarboniferous' | 'MY.epochOrSeriesCretaceous' | 'MY.epochOrSeriesDevonian' | 'MY.epochOrSeriesEdiacaran' | 'MY.epochOrSeriesJurassic' | 'MY.epochOrSeriesOrdovician' | 'MY.epochOrSeriesPermian' | 'MY.epochOrSeriesQuaternary' | 'MY.epochOrSeriesRecent' | 'MY.epochOrSeriesSilurian' | 'MY.epochOrSeriesTertiary' | 'MY.epochOrSeriesTriassic';

  /**
   * Non-negative integer
   */
  femaleIndividualCount?: number;
  genotype?: string;
  gonadInMillimeters?: Array<string>;
  growthMediumName?: string;
  growthOtherConditions?: string;
  growthTemperature?: string;

  /**
   * QName for MY.identification
   */
  hasIdentification?: Array<string>;

  /**
   * QName for MY.subUnit
   */
  hasSubUnit?: Array<string>;

  /**
   * QName for MX.taxon
   */
  hostID?: string;
  hostInformalNameString?: string;

  /**
   * Unique ID for the object. This will be automatically generated.
   */
  id?: string;

  /**
   * QName for MY.identification
   */
  identification?: Array<string>;

  /**
   * Array of identifications
   */
  identifications?: Array<Identifications>;

  /**
   * QName for MM.image
   */
  images?: Array<string>;

  /**
   * Non-negative integer
   */
  individualCount?: number;
  informalNameString?: string;

  /**
   * QName for MVL.informalTaxonGroup
   */
  informalTaxonGroup?: string;

  /**
   * Valitut muotoryhmät. QName for MVL.informalTaxonGroup
   */
  informalTaxonGroups?: Array<string>;
  infrasubspecificSubdivision?: string;
  juvenileIndividualCount?: number;
  keywords?: Array<string>;
  latestEpochOrHighestSeries?: 'MY.epochOrSeriesCambrian' | 'MY.epochOrSeriesCarboniferous' | 'MY.epochOrSeriesCretaceous' | 'MY.epochOrSeriesDevonian' | 'MY.epochOrSeriesEdiacaran' | 'MY.epochOrSeriesJurassic' | 'MY.epochOrSeriesOrdovician' | 'MY.epochOrSeriesPermian' | 'MY.epochOrSeriesQuaternary' | 'MY.epochOrSeriesRecent' | 'MY.epochOrSeriesSilurian' | 'MY.epochOrSeriesTertiary' | 'MY.epochOrSeriesTriassic';
  lengthInMillimeters?: Array<string>;

  /**
   * This field is automatically populated with the objects type and any user given value in here will be ignored!
   */
  '@type'?: string;
  lifeStageDescription?: string;
  likelyMigrant?: boolean;
  macroscopy?: string;

  /**
   * Non-negative integer
   */
  maleIndividualCount?: number;

  /**
   * instance of measurement
   */
  measurement?: Measurement;

  /**
   * According to German TRBA August 2015, which is more comprehensive than the EU or Finnish list for bacterial risk groups
   */
  microbiologicalRiskGroup?: 'MY.microbiologicalRiskGroup1' | 'MY.microbiologicalRiskGroup2' | 'MY.microbiologicalRiskGroup3' | 'MY.microbiologicalRiskGroup4';
  microscopy?: string;
  movingDirection?: 'MY.movingDirectionN' | 'MY.movingDirectionNNE' | 'MY.movingDirectionNE' | 'MY.movingDirectionENE' | 'MY.movingDirectionE' | 'MY.movingDirectionESE' | 'MY.movingDirectionSE' | 'MY.movingDirectionSSE' | 'MY.MovingDirectionS' | 'MY.movingDirectionSSW' | 'MY.movingDirectionSW' | 'MY.movingDirectionWSW' | 'MY.movingDirectionW' | 'MY.movingDirectionWNW' | 'MY.movingDirectionNW' | 'MY.movingDirectionNNW';
  movingStatus?: Array<string>;
  mutant?: string;
  nativeStatus?: 'MY.native' | 'MY.nonNative';

  /**
   * Free-text notes
   */
  notes?: string;
  pairCount?: number;
  plantLifeStage?: 'MY.plantLifeStageSterile' | 'MY.plantLifeStageFertile' | 'MY.plantLifeStageSeed' | 'MY.plantLifeStageSprout' | 'MY.plantLifeStageBud' | 'MY.plantLifeStageFlower' | 'MY.plantLifeStageWitheredFlower' | 'MY.plantLifeStageRipeningFruit' | 'MY.plantLifeStageRipeFruit' | 'MY.plantLifeStageDeadSprout' | 'MY.plantLifeStageSubterranean' | 'MY.plantLifeStageLivingPlant' | 'MY.plantLifeStageDeadPlant';
  plantStatusCode?: 'MY.MY.plantStatusCodeL' | 'MY.plantStatusCodeA' | 'MY.plantStatusCodeAV' | 'MY.plantStatusCodeAOV' | 'MY.plantStatusCodeAN' | 'MY.plantStatusCodeANV' | 'MY.plantStatusCodeANS' | 'MY.plantStatusCodeT' | 'MY.plantStatusCodeTV' | 'MY.plantStatusCodeTOV' | 'MY.plantStatusCodeTNV' | 'MY.plantStatusCodeTNS' | 'MY.plantStatusCodeV' | 'MY.plantStatusCodeOV' | 'MY.plantStatusCodeN' | 'MY.plantStatusCodeNV' | 'MY.plantStatusCodeNS' | 'MY.plantStatusCodeE' | 'MY.plantStatusCodeTE' | 'MY.plantStatusCodeTVE' | 'MY.plantStatusCodeTOVE' | 'MY.plantStatusCodeTNVE' | 'MY.plantStatusCodeTNSE' | 'MY.plantStatusCodeTN' | 'MY.plantStatusCodeTNE' | 'MY.plantStatusCodeR' | 'MY.plantStatusCodeC' | 'MY.plantStatusCodeH' | 'MY.plantStatusCodeG' | 'MY.plantStatusCodeF';

  /**
   * Abundance of the taxon in the field
   */
  populationAbundance?: string;
  preparations?: string;

  /**
   * Methods of preservation. It is possible to choose several.
   */
  preservation?: Array<string>;

  /**
   * Source of the accession
   */
  provenance?: 'MY.provenanceUnknown' | 'MY.provenanceCultivated' | 'MY.provenanceCultivatedUnsure' | 'MY.provenanceCultivatedPropagatedFromWildSource' | 'MY.provenanceWildSource' | 'MY.provenanceWildSourceUnsure' | 'MY.provenanceEscapedCultivated' | 'MY.provenancePropagule';

  /**
   * PUBLIC: all data can be published; PROTECTED: exact locality is hidden; PRIVATE: most of the data is hidden. If blank means same as public
   */
  publicityRestrictions?: 'MZ.publicityRestrictionsPublic' | 'MZ.publicityRestrictionsProtected' | 'MZ.publicityRestrictionsPrivate';
  recordBasis?: 'MY.recordBasisPreservedSpecimen' | 'MY.recordBasisHumanObservation' | 'MY.recordBasisHumanObservationSeen' | 'MY.recordBasisHumanObservationHeard' | 'MY.recordBasisHumanObservationHandled' | 'MY.recordBasisHumanObservationPhoto' | 'MY.recordBasisHumanObservationAudio' | 'MY.recordBasisHumanObservationVideo' | 'MY.recordBasisHumanObservationIndirect' | 'MY.recordBasisMachineObservation' | 'MY.recordBasisMachineObservationVideo' | 'MY.recordBasisMachineObservationAudio' | 'MY.recordBasisMachineObservationGeologger' | 'MY.recordBasisMachineObservationSatelliteTransmitter' | 'MY.recordBasisFossilSpecimen' | 'MY.recordBasisSubfossilSpecimen' | 'MY.recordBasisLivingSpecimen' | 'MY.recordBasisMicrobialSpecimen' | 'MY.recordBasisLiterature';
  recordParts?: Array<string>;
  ring?: string;
  samplingMethod?: 'MY.samplingMethodLight' | 'MY.samplingMethodLightTrap' | 'MY.samplingMethodTrap' | 'MY.samplingMethodMalaise' | 'MY.samplingMethodPitfall' | 'MY.samplingMethodWindowtrap' | 'MY.samplingMethodYellowWindowTrap' | 'MY.samplingMethodPantrap' | 'MY.samplingMethodYellowpan' | 'MY.samplingMethodYellowtrap' | 'MY.samplingMethodFeromonetrap' | 'MY.samplingMethodBaittrap' | 'MY.samplingMethodBait' | 'MY.samplingMethodNet' | 'MY.samplingMethodSweeping' | 'MY.samplingMethodCarnet' | 'MY.samplingMethodMistnet' | 'MY.samplingMethodBoard' | 'MY.samplingMethodReared' | 'MY.samplingMethodExovo' | 'MY.samplingMethodElarva' | 'MY.samplingMethodEpupa' | 'MY.samplingMethodEclectortrap' | 'MY.samplingMethodHand' | 'MY.samplingMethodSifting' | 'MY.samplingMethodSoilsample' | 'MY.samplingMethodDropping' | 'MY.samplingMethodWashing' | 'MY.samplingMethodDigging' | 'MY.samplingMethodDiving' | 'MY.samplingMethodDrag' | 'MY.samplingMethodTriangleDrag' | 'MY.samplingMethodFishNet' | 'MY.samplingMethodElectrofishing' | 'MY.samplingMethodAngleFishing' | 'MY.samplingMethodFishTrap' | 'MY.samplingMethodSeine' | 'MY.samplingMethodTrawling' | 'MY.samplingMethodBeamTrawl' | 'MY.samplingMethodOther';
  samplingMethodNotes?: string;
  sex?: 'MY.sexM' | 'MY.sexF' | 'MY.sexW' | 'MY.sexU' | 'MY.sexN' | 'MY.sexX' | 'MY.sexE' | 'MY.sexC';
  sexNotes?: string;
  shortHandText?: string;
  smell?: 'MY.smellNotSmelled' | 'MY.smellNoSmelled' | 'MY.smellWeak' | 'MY.smellModerate' | 'MY.smellStrong';
  smellNotes?: string;
  substrateClassification?: 'MY.substrateGround' | 'MY.substrateGroundLowShrubs' | 'MY.substrateGroundLichens' | 'MY.substrateGroundHerbs' | 'MY.substrateGroundMosses' | 'MY.substrateGroundSphagnum' | 'MY.substrateGroundGrassy' | 'MY.substrateGroundNeedleLitter' | 'MY.substrateGroundLeafLitter' | 'MY.substrateGroundMixedLitter' | 'MY.substrateGroundSandySoil' | 'MY.substrateGroundGravelSoil' | 'MY.substrateGroundClayeySoil' | 'MY.substrateGroundHeathHumus' | 'MY.substrateGroundMull' | 'MY.substrateGroundPeat' | 'MY.substrateGroundBurnedSoil' | 'MY.substrateLivingTree' | 'MY.substrateLivingTreeTrunk' | 'MY.substrateLivingTreeBase' | 'MY.substrateLivingTreeRoots' | 'MY.substrateLivingTreeBranch' | 'MY.substrateLivingTreeDeadBranch' | 'MY.substrateLivingTreeDeadLimb' | 'MY.substrateLivingTreeLeaf' | 'MY.substrateLivingTreeNeedle' | 'MY.substrateDeadWood' | 'MY.substrateDeadWoodStandingTreeTrunk' | 'MY.substrateDeadWoodStandingTreeBranch' | 'MY.substrateDeadWoodStandingTreeBase' | 'MY.substrateDeadWoodFallenTreeTrunk' | 'MY.substrateDeadWoodFallenTreeBranch' | 'MY.substrateDeadWoodUpturnedRoots' | 'MY.substrateDeadWoodDeadRoots' | 'MY.substrateDeadWoodStump' | 'MY.substrateDeadWoodFallenBranch' | 'MY.substrateDeadWoodCone' | 'MY.substrateDeadWoodTwigs' | 'MY.substrateDeadWoodBark' | 'MY.substrateDeadWoodSawdust' | 'MY.substrateDeadWoodPieceOfWood' | 'MY.substrateDeadWoodLoggingResidue' | 'MY.substrateDeadWoodLog' | 'MY.substrateDeadWoodDriftwood' | 'MY.substrateDeadWoodConstructionWood' | 'MY.substrateDung' | 'MY.substrateCompost' | 'MY.substrateLivingShoot' | 'MY.substrateDeadShoot' | 'MY.substrateLivingFungus' | 'MY.substrateDeadFungus' | 'MY.substrateLivingAnimal' | 'MY.substrateDeadAnimal' | 'MY.substrateRockSurface';
  substrateDecayStage?: 'MY.substrateDecayStageEnum1' | 'MY.substrateDecayStageEnum2' | 'MY.substrateDecayStageEnum3' | 'MY.substrateDecayStageEnum4' | 'MY.substrateDecayStageEnum5';
  substrateNotes?: string;
  substrateSpecies?: string;

  /**
   * QName for MX.taxon
   */
  substrateSpeciesID?: string;
  substrateSpeciesInformalNameString?: string;
  substrateTreeClassification?: Array<string>;
  tailInMillimeters?: Array<string>;
  taste?: 'MY.tasteNotTasted' | 'MY.tasteNoTaste' | 'MY.tasteWeak' | 'MY.tasteModerate' | 'MY.tasteStrong';
  tasteNotes?: string;
  taxonConfidence?: 'MY.taxonConfidenceSure' | 'MY.taxonConfidenceUnsure' | 'MY.taxonConfidenceSubspeciesUnsure';
  twitched?: boolean;

  /**
   * QName for MY.typeSpecimen
   */
  typeSpecimen?: Array<string>;

  /**
   * Array of typeSpecimens
   */
  typeSpecimens?: Array<TypeSpecimens>;

  /**
   * instance of unitFact
   */
  unitFact?: UnitFact;

  /**
   * instance of unitGathering
   */
  unitGathering?: UnitGathering;
  unitType?: Array<string>;
  weightInGrams?: Array<string>;
  wingInMillimeters?: Array<string>;
}
