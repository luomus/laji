/**
 * Query interface for warehouse
 *
 * @property includeNonValidTaxa By default, query results include also entries where target name does not match taxonomy.
 * To get only entries where one and only one taxon matches given target name, set this parameter to false.
 * @property taxonId Filter based on URI or Qname identifier of a taxon. Use Taxonomy-API to find identifiers.
 * Will only return entries where reported target name matches one of the names given to this and only this taxon.
 * Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times. When multiple values
 * are given, this is an OR search.
 * @property target Same as taxon, but system resolves identifier of the taxon based on the given target name.
 * Will only return entries where reported target name matches one of the names given to a taxa and only that taxa.
 * If no such match can be resolved (name does not exist in taxonomy), will filter based on the given verbatim target
 * name (case insensitive). Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times.
 * When multiple values are given, this is an OR search.
 * @property informalTaxonGroupId Filter based on URI or Qname identifier of an informal taxon group.
 * Use InformalTaxonGroups-API to find identifiers. Will return entries of taxons that belong to the groups.
 * Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times.
 * When multiple values are given, this is an OR search.
 * @property administrativeStatusId Filter based on URI or Qname identifier of an administrative status.
 * Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the admin status.
 * Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times.
 * When multiple values are given, this is an OR search.
 * @property redListStatusId Filter based on URI or Qname identifier of red list status.
 * Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the red list status.
 * Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times.
 * When multiple values are given, this is an OR search.
 * @property finnish Filter only those taxons that are finnish or are not finnish.
 * @property invasive Filter only those taxons that are invasive or are not invasive.
 * @property countryId Filter based on URI or Qname identifier of a country. Use Area-API to find identifiers.
 * Will return entries where the country has been identified using coordinates or name without contradictions.
 * Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times.
 * When multiple values are given, this is an OR search.
 * @property finnishMunicipalityId Filter based on URI or Qname identifier of a finnish municipality.
 * Use Area-API to find identifiers. Will return entries where the municipality has been identified using coordinates
 * or name without contradictions. Multiple values are seperated by a comma (,) or by giving the HTTP parameter
 * multiple times. When multiple values are given, this is an OR search.
 * @property biogeographicalProvinceId Filter based on URI or Qname identifier of a biogeographical province.
 * Use Area-API to find identifiers. Will return entries where the province has been identified using coordinates or
 * name without contradictions. Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple
 * times. When multiple values are given, this is an OR search.
 * @property area Filter using country, municipality or province name or locality. If identifier is resolved for
 * country or municipality, filters using that identifier. If area name does not match any identifier,
 * search from country verbatim, municipality verbatim, province verbatim and locality using exact match case
 * insensitive search. Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times.
 * When multiple values are given, this is an OR search.
 * @property time Filter using event date. Date can be a full date or part of a date,
 * for example 2000, 2000-06 or 2000-06-25. Time can be a range, for example 2000/2005 or 2000-01-01/2005-12-31.
 * Short forms for \&quot;last N days\&quot; can be used: 0 is today, -1 is yesterday and so on;
 * for example -7/0 isa range between 7 days ago and today. Multiple values are seperated by a comma (,) or by giving
 * the HTTP parameter multiple times. When multiple values are given, this is an OR search.
 * @property dayOfYearBegin Filter using day of year. For example day of year begin &#x3D; 100, day of year end &#x3D;
 * 160 gives all records during \&quot;spring time\&quot;.
 * @property dayOfYearEnd Filter using day of year. For example day of year begin &#x3D; 100, day of year end &#x3D;
 * 160 gives all records during \&quot;spring time\&quot;.
 * @property keyword Filter using keywords that have been tagged to entries. There are many types of keywods verying
 * between data sets, for example legacy identifiers, project names and IDs, etc. Multiple values are seperated by
 * a comma (,) or by giving the HTTP parameter multiple times. When multiple values are given, this is an OR search.
 * @property collectionId Filter using identifiers of collections. Use Collections-API to resolve identifiers.
 * Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times.
 * When multiple values are given, this is an OR search.
 * @property sourceId Filter using identifiers of data sources (information systems).
 * Use InformationSystem-API to resolve identifiers.
 * Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times.
 * When multiple values are given, this is an OR search.
 * @property recordBasis Filter using record basis. This can be used for example to get only preserved specimens.
 * Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times.
 * When multiple values are given, this is an OR search.
 * @property lifeStage Filter using life stage of an unit. Multiple values are seperated by a comma (,) or by giving
 * the HTTP parameter multiple times. When multiple values are given, this is an OR search.
 * @property sex Filter using sex of an unit. Multiple values are seperated by a comma (,) or by giving
 * the HTTP parameter multiple times. When multiple values are given, this is an OR search.
 * @property documentId Filter using document URIs. Multiple values are seperated by a comma (,) or by giving the
 * HTTP parameter multiple times. When multiple values are given, this is an OR search.
 * @property unitId Filter using unit ids. Multiple values are seperated by a comma (,) or by giving the HTTP parameter
 * multiple times. When multiple values are given, this is an OR search.
 * @property individualId Filter using identifier of an individual, for example bird ring.
 * Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times.
 * When multiple values are given, this is an OR search.
 * @property individualCountMin Filter using idividual count.
 * Unreported individual count is assumed to mean \&quot;1+\&quot;, so searching min&#x3D;1 returns where count &gt; 0
 * or count is not given. To search for \&quot;null observations\&quot; use max&#x3D;0.
 * @property individualCountMax Filter using idividual count.
 * Unreported individual count is assumed to mean \&quot;1+\&quot;, so searching min&#x3D;1 returns where count &gt; 0
 * or count is not given. To search for \&quot;null observations\&quot; use max&#x3D;0.
 * @property loadedLaterThan Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd.
 * Returns entries loaded latern than the given date, inclusive.
 * @property coordinates Filter using coordinates.
 * Valid formats are latMin:latMax:lonMin:lonMax:system and lat:lon:system. Valid systems are WGS84 and YKJ.
 * The search 666:333:YKJ means ykj-lat between 6660000-6670000 and ykj-lon between 3330000-3340000.
 * Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times
 * When multiple values are given, this is an OR search.
 * @property typeSpecimen Filter only type specimens or those that are not type specimens.
 * @property hasDocumentMedia Filter only units where parent document has media or doesn&#39;t have media.
 * @property hasGatheringMedia Filter only units where parent gathering has media or doesn&#39;t have media.
 * @property hasUnittMedia Filter only units where unit has media or doesn&#39;t have media.
 * @property hasMedia Filter only units where parent document, gathering or unit has media or none have media.
 * @property secureReason Filter based on secure reasons. Multiple values are seperated by a comma (,) or by giving
 * the HTTP parameter multiple times. When multiple values are given, this is an OR search.
 * @property editorId Filter based on \&quot;owner\&quot; of records. Only available in private-query-API.
 * Multiple values are seperated by a comma (,) or by giving the HTTP parameter multiple times.
 * When multiple values are given, this is an OR search.
 */
export interface WarehouseQueryInterface {
  includeNonValidTaxa?: boolean;
  taxonId?: Array<string>;
  target?: Array<string>;
  taxonRankId?: string;
  informalTaxonGroupId?: Array<string>;
  administrativeStatusId?: Array<string>;
  redListStatusId?: Array<string>;
  finnish?: boolean;
  invasive?: boolean;
  countryId?: Array<string>;
  finnishMunicipalityId?: Array<string>;
  biogeographicalProvinceId?: Array<string>;
  area?: Array<string>;
  time?: Array<string>;
  dayOfYearBegin?: number;
  dayOfYearEnd?: number;
  keyword?: Array<string>;
  collectionId?: Array<string>;
  coordinateAccuracyMax?: number;
  sourceId?: Array<string>;
  superRecordBasis?: Array<string>;
  recordBasis?: Array<string>;
  lifeStage?: Array<string>;
  sex?: Array<string>;
  documentId?: Array<string>;
  unitId?: Array<string>;
  individualId?: Array<string>;
  individualCountMin?: number;
  individualCountMax?: number;
  loadedLaterThan?: Date;
  coordinates?: Array<string>;
  typeSpecimen?: boolean;
  hasDocumentMedia?: boolean;
  hasGatheringMedia?: boolean;
  hasUnitMedia?: boolean;
  hasMedia?: boolean;
  secureReason?: Array<string>;
  editorId?: Array<string>;
  secured?: boolean;
  ykj10km?: string;
  ykj10kmCenter?: string;
  cache?: boolean;
  reliable?: boolean;
  observerPersonToken?: string;
  editorPersonToken?: string;
  qualityIssues?: string;
}
