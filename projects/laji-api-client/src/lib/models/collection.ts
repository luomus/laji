/* tslint:disable */
export interface Collection {

  /**
   * Description of the rights governing the data (for example, what contracts have been made about this). If left blank, Luomus data policy is followed. If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  intellectualDescription?: string;

  /**
   * More descriptive name for the collection
   */
  longName?: string;
  id: string;

  /**
   * Secure level (salaus-/karkeistustaso) for the data
   */
  secureLevel?: 'MX.secureLevelNone' | 'MX.secureLevelKM1' | 'MX.secureLevelKM5' | 'MX.secureLevelKM10' | 'MX.secureLevelKM25' | 'MX.secureLevelKM50' | 'MX.secureLevelKM100' | 'MX.secureLevelHighest' | 'MX.secureLevelNoShow';

  /**
   * Official abbreviation (or acronym) for this collection
   */
  abbreviation?: string;

  /**
   * Example how to cite this collection in a scientific article, if using organization, name and abbreviation is not enough.
   */
  citation?: string;

  /**
   * Name of the collection in different languages. (Not name of collection database.) If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  collectionName?: string;

  /**
   * How many specimens, records or such does the collection contain? Fill in approximate number, describe more in notes if necessary.
   */
  collectionSize?: string;

  /**
   * Type of the collection (specimen, monitoring etc).
   */
  collectionType?: 'MY.collectionTypeSpecimens' | 'MY.collectionTypeLiving' | 'MY.collectionTypeMonitoring' | 'MY.collectionTypeObservations' | 'MY.collectionTypePublicationdata' | 'MY.collectionTypePublication' | 'MY.collectionTypeMixed' | 'MY.collectionTypeOther' | 'MY.collectionTypeGardenArea';

  /**
   * Legal basis for concealment or quarantine If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  concealmentBasis?: string;

  /**
   * Personal or general (e.g. group of people in the organisation) email address to reach the person(s) responsible.
   */
  contactEmail?: string;

  /**
   * Concise definition of the coverage, if not clear from name or description. For example, 'Winter birds of Finland'. If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  coverageBasis?: string;

  /**
   * Quality estimation for the data in this collection
   */
  dataQuality?: 'MY.dataQuality1' | 'MY.dataQuality2' | 'MY.dataQuality3' | 'MY.dataQuality4' | 'MY.dataQuality5' | 'MY.dataQualityNA';

  /**
   * Description and reasons for the data quality in different languages. If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  dataQualityDescription?: string;

  /**
   * Quarantine period in years after which data is opened
   */
  dataQuarantinePeriod?: number;

  /**
   * Description of possible special terms for data use (for example not for commercial purposes etc.) If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  dataUseTerms?: string;

  /**
   * Free-form description of the collection in different languages. If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  description?: string;

  /**
   * How many percent of the collection is in digital form, e.g. in a database or Excel file? Fill in approximate number, describe more in notes if necessary.
   */
  digitizedSize?: string;

  /**
   * Admin field. The identifier of the person responsible for handling requests for restricted data for this set (typically same person who's responsible for the collection)
   */
  downloadRequestHandler?: Array<string>;

  /**
   * Reason for this edit or notes about it.
   */
  editNotes?: string;

  /**
   * Smallest common geographical area for the specimens/data in the collection (for example, country or continent name). If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  geographicCoverage?: string;

  /**
   * Whether or not this collection has sub collections
   */
  hasChildren?: boolean;

  /**
   * Name of the data owner; ONLY fill this if the owner is not clear from the parent collection name(s). E.g. "University of Oulu" or "Luomus"
   */
  intellectualOwner?: string;

  /**
   * License which is used when publishing data that belongs to this collection.
   */
  intellectualRights?: 'MY.intellectualRightsCC-BY' | 'MY.intellectualRightsCC0' | 'MY.intellectualRightsPD' | 'MY.intellectualRightsARR';
  internalUseOnly?: boolean;

  /**
   * Which parent or larger collection this is part of.
   */
  isPartOf?: string;

  /**
   * Language the data is (mainly) written in, if applicable.
   */
  language?: string;
  metadataCreator?: string;

  /**
   * Indication of how comprehensive the information on this form is.
   */
  metadataStatus?: 'MY.metadataStatusPreliminary' | 'MY.metadataStatusSatisfactory' | 'MY.metadataStatusComprehensive' | 'MY.metadataStatusHidden';

  /**
   * Methods used when creating this collection, if they are standardized. Includes information on items such as census methods, tools, instrument calibration and software. If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  methods?: string;

  /**
   * Additional information to the data in each section.
   */
  notes?: string;

  /**
   * Web address (URL) with more info about the collection. If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  onlineUrl?: string;

  /**
   * Person(s) responsible for the collection (Lastname, Firstname; Lastname, Firstname).
   */
  personResponsible?: string;

  /**
   * Description of possible restrictions on publication of the data (for example, is there data about endangered species which should be concealed?) If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  publicationDescription?: string;

  /**
   * How can Luomus publish the data, if it is owned by third party?
   */
  publicationTerms?: 'MY.publicationTermsFree' | 'MY.publicationTermsOfficial' | 'MY.publicationTermsInternal' | 'MY.publicationTermsNone';

  /**
   * Lowest common taxon in the collection (for example, scientific name of an order). If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  taxonomicCoverage?: string;

  /**
   * When were the specimens/data collected? If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  temporalCoverage?: string;

  /**
   * How many TYPE specimens does the collection contain?  Fill in approximate number, describe more in notes if necessary.
   */
  typesSize?: string;
  dateCreated?: string;
  dateEdited?: string;

  /**
   * Team or organisation that owns the record and can edit it.
   */
  owner?: string;

  /**
   * PUBLIC: all data can be published; PROTECTED: exact locality is hidden (100*100km square); PRIVATE: most of the data is hidden. Empty value means same as public.
   */
  publicityRestrictions?: 'MZ.publicityRestrictionsPublic' | 'MZ.publicityRestrictionsProtected' | 'MZ.publicityRestrictionsPrivate';
}
