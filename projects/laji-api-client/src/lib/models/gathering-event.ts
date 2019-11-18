/* tslint:disable */
export interface GatheringEvent {

  /**
   * Name of the collector(s), in format 'Lastname, Firstname; Lastname Firstname'
   */
  leg?: Array<string>;

  /**
   * Context for the given json
   */
  '@context'?: string;

  /**
   * Non-negative integer
   */
  breaksDuringCensusInMinutes?: number;
  censusHinderedByEnviromentalFactors?: boolean;
  censusPrematurelyAborted?: boolean;
  dateBegin?: string;
  dateEnd?: string;
  gpsUsed?: boolean;

  /**
   * Unique ID for the object. This will be automatically generated.
   */
  id?: string;

  /**
   * This field is automatically populated with the objects type and any user given value in here will be ignored!
   */
  '@type'?: string;
  legPublic?: boolean;

  /**
   * Alkuperäislähteen käyttäjätunnus
   */
  legUserID?: Array<string>;
  namedPlaceNotes?: string;
  routeDirectionAdhered?: boolean;
  startDistanceFromNECorner?: string;
  startPointDeviation?: number;
  timeEnd?: string;
  timeStart?: string;
}
