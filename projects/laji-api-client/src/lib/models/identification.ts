/* tslint:disable */
export interface Identification {
  infrasubspecificSubdivision?: string;

  /**
   * Write associated taxa names here, separated by a semicolon (;). E.g.: \"Betula pendula; Betula pubescens; Poaceae\".
   */
  associatedObservationTaxa?: string;

  /**
   * Name of the identifier (person)
   */
  det?: string;
  detDate?: string;
  detMethod?: 'MY.detMethodFreshSample' | 'MY.detMethodMicroscopy' | 'MY.detMethodPhoto';
  detVerbatim?: string;
  genusQualifier?: string;
  identificationBasis?: Array<string>;
  identificationDate?: string;
  identificationNotes?: string;
  infraAuthor?: string;
  infraEpithet?: string;
  infraRank?: 'MY.infraRankSsp' | 'MY.infraRankVar' | 'MY.infraRankBeta' | 'MY.infraRankB' | 'MY.infraRankForma' | 'MY.infraRankHybrid' | 'MY.infraRankAnamorph' | 'MY.infraRankAggregate' | 'MY.infraRankAberration' | 'MY.infraRankCultivar' | 'MY.infraRankMorpha' | 'MY.infraRankUnknown' | 'MY.infraRankNothosubspecies' | 'MY.infraRankCultivarGroup';
  author?: string;
  isTaxonGroup?: boolean;

  /**
   * This can be used to select one of the identifications as 'recommended', which is the used as default when displaying information about the specimen.
   */
  preferredIdentification?: string;

  /**
   * PUBLIC: all data can be published; PROTECTED: exact locality is hidden; PRIVATE: most of the data is hidden. If blank means same as public
   */
  publicityRestrictions?: 'MZ.publicityRestrictionsPublic' | 'MZ.publicityRestrictionsProtected' | 'MZ.publicityRestrictionsPrivate';

  /**
   * Publication reference for the taxon concept, that was used in identification
   */
  sec?: string;
  sortOrder?: number;

  /**
   * Additional qualifier at species level (e.g. af, cf, sp. n, coll.)
   */
  speciesQualifier?: string;
  taxon?: string;
  taxonID?: string;
  taxonRank?: 'MX.superdomain' | 'MX.domain' | 'MX.kingdom' | 'MX.subkingdom' | 'MX.infrakingdom' | 'MX.superphylum' | 'MX.phylum' | 'MX.subphylum' | 'MX.infraphylum' | 'MX.superdivision' | 'MX.division' | 'MX.subdivision' | 'MX.infradivision' | 'MX.superclass' | 'MX.class' | 'MX.subclass' | 'MX.infraclass' | 'MX.parvclass' | 'MX.superorder' | 'MX.order' | 'MX.suborder' | 'MX.infraorder' | 'MX.parvorder' | 'MX.superfamily' | 'MX.family' | 'MX.subfamily' | 'MX.tribe' | 'MX.subtribe' | 'MX.supergenus' | 'MX.genus' | 'MX.nothogenus' | 'MX.subgenus' | 'MX.section' | 'MX.subsection' | 'MX.series' | 'MX.subseries' | 'MX.infragenericTaxon' | 'MX.aggregate' | 'MX.species' | 'MX.nothospecies' | 'MX.infraspecificTaxon' | 'MX.subspecificAggregate' | 'MX.subspecies' | 'MX.nothosubspecies' | 'MX.variety' | 'MX.subvariety' | 'MX.form' | 'MX.subform' | 'MX.hybrid' | 'MX.anamorph' | 'MX.ecotype' | 'MX.populationGroup' | 'MX.intergenericHybrid' | 'MX.infragenericHybrid' | 'MX.cultivar' | 'MX.group' | 'MX.speciesAggregate';
  taxonSpecifier?: string;

  /**
   * QName for MX.taxon
   */
  taxonURI?: string;

  /**
   * Taxon name in original format (e.g. from the label), errors and all
   */
  taxonVerbatim?: string;
}
