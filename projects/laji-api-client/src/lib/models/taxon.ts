/* tslint:disable */
import { TaxaMedia } from './taxa-media';
import { TaxaDescription } from './taxa-description';
export interface Taxon {
  redListStatus2010Finland?: 'MX.iucnEX' | 'MX.iucnEW' | 'MX.iucnRE' | 'MX.iucnCR' | 'MX.iucnEN' | 'MX.iucnVU' | 'MX.iucnNT' | 'MX.iucnLC' | 'MX.iucnDD' | 'MX.iucnNA' | 'MX.iucnNE';
  id: string;

  /**
   * <p>Lisämerkinnät:</p>
   * <ul>
   * <li><b>v - vanhat metsät</b> (myös yksittäiset vanhat puut ja runsaasti lahopuuta sisältävät nuoremmat metsät)</li>
   * <li><b>h - harjumetsät</b>, myös puoliavoimet</li>
   * <li><b>p - metsäpaloalueet</b> ja muut luontaisen sukkession alkuvaiheen metsät</li>
   * <li><b>j - jalopuuesiintymä</b></li>
   * <li><b>pa - paahteinen</b></li>
   * <li><b>va - varjoinen</b></li>
   * <li><b>ra - sijaitsee rannalla</b> (lajin esiintyminen on sidoksissa rannan läheisyyteen)</li>
   * <li><b>ka - karut kalliot ja kivikot</b></li>
   * <li><b>ke - keskiravinteiset kalliot ja kivikot</b></li>
   * <li><b>ca - kalkkivaikutteinen</b></li>
   * </ul>
   */
  primaryHabitat?: string;
  secondaryHabitat?: Array<string>;

  /**
   * Identifier of this taxon concept/name in other systems/sources
   */
  additionalID?: Array<string>;

  /**
   * Leväosakkaiden kuvaus
   */
  algalPartnerOfLichen?: string;
  alsoKnownAs?: Array<string>;

  /**
   * Lajin elintavat
   */
  behaviour?: string;
  birdlifeCode?: string;
  breedingSecureLevel?: 'MX.secureLevelNone' | 'MX.secureLevelKM1' | 'MX.secureLevelKM5' | 'MX.secureLevelKM10' | 'MX.secureLevelKM25' | 'MX.secureLevelKM50' | 'MX.secureLevelKM100' | 'MX.secureLevelHighest' | 'MX.secureLevelNoShow';
  circumscription?: string;
  cultivationText?: string;
  customReportFormLink?: string;
  distributionFinland?: string;
  distributionMapFinland?: string;

  /**
   * Lajin ekologian sekalainen kuvaus
   */
  ecology?: string;
  economicUseText?: string;
  etymologyText?: string;
  euringCode?: string;
  externalLinkURL?: string;

  /**
   * taxon occurs in Finland
   */
  finnish?: boolean;
  frequencyScoringPoints?: number;
  growthFormAndGrowthHabit?: string;

  /**
   * Lajin elinympäristö
   */
  habitat?: string;

  /**
   * Lajin kasvialusta
   */
  habitatSubstrate?: string;
  hasAlternativeName?: Array<string>;

  /**
   * Should this taxon be hidden when showing contents of a checklist (publicly)?
   */
  hiddenTaxon?: boolean;
  identificationText?: string;
  ingressText?: string;
  invasiveCitizenActionsText?: string;
  invasiveEffectText?: string;
  invasivePreventionMethodsText?: string;
  invasiveSpeciesEarlyWarning?: boolean;
  invasiveSpeciesEstablishment?: 'MX.invasiveEstablished' | 'MX.invasiveSporadic' | 'MX.invasiveNotYetInFinland' | 'MX.invasiveEstablishmentUnknown' | 'MX.invasiveEstablishmentAccidental';
  isPartOf?: string;
  isPartOfInformalTaxonGroup?: Array<string>;

  /**
   * Eliön elinkierto
   */
  lifeCycle?: string;
  management?: string;
  miscText?: string;
  nameAccordingTo?: string;
  nameDecidedBy?: string;
  nameDecidedDate?: string;
  naturaAreaSecureLevel?: 'MX.secureLevelNone' | 'MX.secureLevelKM1' | 'MX.secureLevelKM5' | 'MX.secureLevelKM10' | 'MX.secureLevelKM25' | 'MX.secureLevelKM50' | 'MX.secureLevelKM100' | 'MX.secureLevelHighest' | 'MX.secureLevelNoShow';
  nestSiteSecureLevel?: 'MX.secureLevelNone' | 'MX.secureLevelKM1' | 'MX.secureLevelKM5' | 'MX.secureLevelKM10' | 'MX.secureLevelKM25' | 'MX.secureLevelKM50' | 'MX.secureLevelKM100' | 'MX.secureLevelHighest' | 'MX.secureLevelNoShow';
  notes?: string;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  obsoleteVernacularName?: Array<string>;
  occurrenceInFinland?: 'MX.doesNotOccur' | 'MX.occurrenceInFinlandPublished' | 'MX.occurrenceInFinlandCollected' | 'MX.occurrenceInFinlandObserved' | 'MX.occurrenceInFinlandPublishedUncertain' | 'MX.occurrenceInFinlandCollectedUncertain' | 'MX.occurrenceInFinlandObservedUncertain' | 'MX.occurrenceInFinlandPublishedError' | 'MX.occurrenceInFinlandPresumed';
  occurrenceInFinlandPublication?: Array<string>;
  occurrenceInFinlandSpecimenURI?: string;
  originAndDistributionText?: string;
  originalDescription?: string;
  originalPublication?: Array<string>;
  overridingTargetName?: Array<string>;
  productionText?: string;
  redListStatus2000Finland?: 'MX.iucnEX' | 'MX.iucnEW' | 'MX.iucnRE' | 'MX.iucnCR' | 'MX.iucnEN' | 'MX.iucnVU' | 'MX.iucnNT' | 'MX.iucnLC' | 'MX.iucnDD' | 'MX.iucnNA' | 'MX.iucnNE';
  herbo:sortOrder?: number;
  redListStatus2015Finland?: 'MX.iucnEX' | 'MX.iucnEW' | 'MX.iucnRE' | 'MX.iucnCR' | 'MX.iucnEN' | 'MX.iucnVU' | 'MX.iucnNT' | 'MX.iucnLC' | 'MX.iucnDD' | 'MX.iucnNA' | 'MX.iucnNE';
  redListStatus2019Finland?: 'MX.iucnEX' | 'MX.iucnEW' | 'MX.iucnRE' | 'MX.iucnCR' | 'MX.iucnEN' | 'MX.iucnVU' | 'MX.iucnNT' | 'MX.iucnLC' | 'MX.iucnDD' | 'MX.iucnNA' | 'MX.iucnNE';
  reproduction?: string;

  /**
   * Kukinta-aika
   */
  reproductionFloweringTime?: string;

  /**
   * Pölytyksen kuvaus
   */
  reproductionPollination?: string;
  scientificName?: string;
  scientificNameAuthorship?: string;

  /**
   * Secure level (salaus-/karkeistustaso) for the data
   */
  secureLevel?: 'MX.secureLevelNone' | 'MX.secureLevelKM1' | 'MX.secureLevelKM5' | 'MX.secureLevelKM10' | 'MX.secureLevelKM25' | 'MX.secureLevelKM50' | 'MX.secureLevelKM100' | 'MX.secureLevelHighest' | 'MX.secureLevelNoShow';
  stopOccurrenceInFinlandPublicationInheritance?: boolean;
  stopOriginalPublicationInheritance?: boolean;
  targetName?: Array<string>;
  taxonEditor?: Array<string>;
  taxonExpert?: Array<string>;
  taxonRank?: 'MX.superdomain' | 'MX.domain' | 'MX.kingdom' | 'MX.subkingdom' | 'MX.infrakingdom' | 'MX.infrakingdom' | 'MX.superphylum' | 'MX.phylum' | 'MX.subphylum' | 'MX.infraphylum' | 'MX.superdivision' | 'MX.division' | 'MX.subdivision' | 'MX.infradivision' | 'MX.superclass' | 'MX.class' | 'MX.subclass' | 'MX.infraclass' | 'MX.parvclass' | 'MX.superorder' | 'MX.order' | 'MX.suborder' | 'MX.infraorder' | 'MX.parvorder' | 'MX.superfamily' | 'MX.family' | 'MX.subfamily' | 'MX.tribe' | 'MX.subtribe' | 'MX.supergenus' | 'MX.genus' | 'MX.nothogenus' | 'MX.subgenus' | 'MX.section' | 'MX.subsection' | 'MX.series' | 'MX.subseries' | 'MX.infragenericTaxon' | 'MX.aggregate' | 'MX.species' | 'MX.nothospecies' | 'MX.infraspecificTaxon' | 'MX.subspecificAggregate' | 'MX.subspecies' | 'MX.nothosubspecies' | 'MX.variety' | 'MX.subvariety' | 'MX.form' | 'MX.subform' | 'MX.hybrid' | 'MX.anamorph' | 'MX.ecotype' | 'MX.populationGroup' | 'MX.intergenericHybrid' | 'MX.infragenericHybrid' | 'MX.cultivar' | 'MX.group' | 'MX.speciesAggregate';
  taxonomyText?: string;
  tradeName?: Array<string>;
  typeOfOccurrenceInFinland?: Array<string>;
  typeOfOccurrenceInFinlandNotes?: string;
  typeSpecimenURI?: string;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  vernacularName?: string;
  winteringSecureLevel?: 'MX.secureLevelNone' | 'MX.secureLevelKM1' | 'MX.secureLevelKM5' | 'MX.secureLevelKM10' | 'MX.secureLevelKM25' | 'MX.secureLevelKM50' | 'MX.secureLevelKM100' | 'MX.secureLevelHighest' | 'MX.secureLevelNoShow';
  createdAtTimestamp?: number;
  synonymNames?: Array<string>;
  informalTaxonGroups?: Array<string>;
  occurrences?: Array<{}>;
  multimedia?: Array<TaxaMedia>;
  descriptions?: Array<TaxaDescription>;
  synonyms?: Array<Taxon>;
  misappliedNames?: Array<Taxon>;
  misspelledNames?: Array<Taxon>;
  basionyms?: Array<Taxon>;
  objectiveSynonyms?: Array<Taxon>;
  subjectiveSynonyms?: Array<Taxon>;
  orthographicVariants?: Array<Taxon>;
  homotypicSynonyms?: Array<Taxon>;
  heterotypicSynonyms?: Array<Taxon>;
  uncertainSynonyms?: Array<Taxon>;
  includes?: Array<Taxon>;
  includedIn?: Array<Taxon>;
  children?: Array<Taxon>;
  administrativeStatuses?: Array<string>;
  species?: boolean;
  invasiveSpecies?: boolean;

  /**
   * should the name appear cursive
   */
  cursiveName?: boolean;
  countOfSpecies?: number;
  countOfFinnishSpecies?: number;

  /**
   * is taxon species or subspecies or etc and occurs in Finland
   */
  finnishSpecies?: boolean;

  /**
   * stable in Finland
   */
  stableInFinland?: boolean;
  expertChangesFromParent?: boolean;

  /**
   * sort order for taxonomic sorting
   */
  taxonomicSortOrder?: number;

  /**
   * true if has parents
   */
  hasParent?: boolean;

  /**
   * true if has children
   */
  hasChildren?: boolean;
  latestRedListStatusFinland?: {};
  redListStatusesInFinland?: Array<{}>;
  additionalIds?: Array<string>;
}
