/* tslint:disable */
import { GatheringEvent } from './gathering-event';
import { Gatherings } from './gatherings';
export interface Document {

  /**
   * instance of gatheringEvent
   */
  gatheringEvent?: GatheringEvent;

  /**
   * Unique ID for the object. This will be automatically generated.
   */
  id?: string;

  /**
   * This field is automatically populated with the objects type and any user given value in here will be ignored!
   */
  '@type'?: string;

  /**
   * Leave empty if no sample taken, or if the sample was recorded separately
   */
  DNASampleLocation?: string;
  IPEN?: string;

  /**
   * URL where more information is available about the specimen
   */
  URL?: string;

  /**
   * QName for MZ.keyAny
   */
  acknowledgedWarnings?: Array<string>;

  /**
   * From who/where the specimen was acquired (if not recorded as a transaction)
   */
  acquiredFrom?: string;

  /**
   * QName for MOS.organization
   */
  acquiredFromOrganization?: string;

  /**
   * Date or year on which the specimen was acquired to the collection. Empty means and old specimen acquired on an unknown date.
   */
  acquisitionDate?: string;

  /**
   * Other identifiers this specimen has, in format 'type:identifier'. For example: 'mzhtypes:123' (old MAZ-type number)
   */
  additionalIDs?: Array<string>;

  /**
   * You can include additonal comment by separating them with colon, e.g. \"AY123456:comments here\"
   */
  bold?: Array<string>;
  caption?: string;

  /**
   * Clad book id number or such
   */
  cladBookID?: string;

  /**
   * Clad specimen id: usually color description and a number
   */
  cladSpecimenID?: string;

  /**
   * Verbatim specimen data from clad book
   */
  cladVerbatim?: string;

  /**
   * The collection which this specimen belongs to. QName for MY.collection
   */
  collectionID?: string;

  /**
   * Notes on the defects of the specimen (missing parts or such). Empty value means same as \"good\" or \"hyvä\" - that the specimen is in fine condition.
   */
  condition?: string;

  /**
   * QName for MA.person
   */
  creator?: string;
  cultivationInformation?: string;

  /**
   * Where the data about this specimen is from, in addition to labels.
   */
  dataSource?: string;

  /**
   * The dataset(s) this specimen belongs to. QName for GX.dataset
   */
  datasetID?: Array<string>;
  datatype?: string;

  /**
   * dateTime string using ISO8601 format
   */
  dateCreated?: string;

  /**
   * dateTime string using ISO8601 format
   */
  dateEdited?: string;
  deviceID?: string;

  /**
   * Location of the specimen so that museum personnel can find it. E.g. taxon under which it is stored (if not clear from the identification), or shelf number
   */
  documentLocation?: string;

  /**
   * Description where duplicates (specimens of the same individual) have been sent to and by which ID's
   */
  duplicatesIn?: string;

  /**
   * Reason for this edit or notes about it.
   */
  editNotes?: string;

  /**
   * Name of the person(s) (and possibly the organization) who first transcribed the data
   */
  editor?: string;

  /**
   * QName for MA.person
   */
  editors?: Array<string>;

  /**
   * Date the data was first transcribed into electronic format or paper registry
   */
  entered?: string;

  /**
   * Diary-style information about what has been done to the specimen
   */
  event?: Array<string>;

  /**
   * Name of the exiccatum this specimen belongs to
   */
  exsiccatum?: string;

  /**
   * Id of the form that was used for the document
   */
  formID?: string;

  /**
   * QName for MY.gathering
   */
  gathering?: Array<string>;

  /**
   * Context for the given json
   */
  '@context'?: string;

  /**
   * Array of gatherings
   */
  gatherings?: Array<Gatherings>;

  /**
   * You can include additonal comment by separating them with colon, e.g. \"AY123456:comments here\"
   */
  genbank?: Array<string>;

  /**
   * QName for MY.gathering
   */
  hasGathering?: Array<string>;

  /**
   * QName for MM.image
   */
  images?: Array<string>;
  isTemplate?: boolean;
  keywords?: Array<string>;

  /**
   * Text from labels word-for-word, including spelling errors. Separate each label on its own row, starting from topmost label.
   */
  labelsVerbatim?: string;

  /**
   * Language the specimen data is (mainly) written in, if applicable.
   */
  language?: string;

  /**
   * Collector's identifier (field identifier, keruunumero) for the specimen
   */
  legID?: string;
  locked?: boolean;

  /**
   * QName for MNP.namedPlace
   */
  namedPlaceID?: string;

  /**
   * Free-text notes
   */
  notes?: string;

  /**
   * Original catalogue number or other  original identifier of the specimen. E.g. H9000000
   */
  originalSpecimenID?: string;

  /**
   * Team that owns the record and can edit it.. QName for MOS.organization
   */
  owner?: string;
  plannedLocation?: string;

  /**
   * Methods of preservation. It is possible to choose several.
   */
  preservation?: Array<string>;

  /**
   * Location of the primary data if not Kotka.
   */
  primaryDataLocation?: string;

  /**
   * Publication references or doi's that refer to this specimen
   */
  publication?: Array<string>;

  /**
   * PUBLIC: all data can be published; PROTECTED: exact locality is hidden; PRIVATE: most of the data is hidden. If blank means same as public
   */
  publicityRestrictions?: 'MZ.publicityRestrictionsPublic' | 'MZ.publicityRestrictionsProtected' | 'MZ.publicityRestrictionsPrivate';

  /**
   * Relationship to another taxon OR specimen. Prefix with relationship type, e.g. \"parasite: Parasiticus specius\" OR \"host:http://tun.fi/JAA.123\"
   */
  relationship?: Array<string>;

  /**
   * The history of the sample
   */
  sampleHistory?: string;
  scheduledForDeletion?: boolean;
  secureLevel?: 'MX.secureLevelNone' | 'MX.secureLevelKM1' | 'MX.secureLevelKM5' | 'MX.secureLevelKM10' | 'MX.secureLevelKM25' | 'MX.secureLevelKM50' | 'MX.secureLevelKM100' | 'MX.secureLevelHighest' | 'MX.secureLevelNoShow';

  /**
   * ID of the specimen from which this has been separated from
   */
  separatedFrom?: string;

  /**
   * ID's of those new specimens that have been separated from this specimen
   */
  separatedTo?: Array<string>;
  serialNumber?: string;

  /**
   * QName for KE.informationSystem
   */
  sourceID?: string;

  /**
   * Empty value means same as \"ok\" - that there is not anything special about the status of the specimen.
   */
  status?: 'MY.statusOk' | 'MY.statusMissing' | 'MY.statusUnrecoverable' | 'MY.statusLost' | 'MY.statusDonated' | 'MY.statusDeposited' | 'MY.statusDeaccessioned' | 'MY.statusDiscarded' | 'MY.statusSpent' | 'MY.statusDestroyed' | 'MY.statusUndefined' | 'MY.statusAxenic' | 'MY.statusNonAxenic' | 'MY.statusNotAvailable' | 'MY.statusDead';
  temp?: boolean;
  templateDescription?: string;
  templateName?: string;
  transcriberNotes?: string;

  /**
   * Common name of agreement concerning the transfer, if any.
   */
  transferAgreement?: string;

  /**
   * List of those fields that contain unreliable data. The list is created automatically.
   */
  unreliableFields?: string;

  /**
   * Information about the quality of the specimen
   */
  verificationStatus?: Array<string>;
  voucherSpecimenID?: string;
}
