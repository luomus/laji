/* tslint:disable */
export interface Profile {

  /**
   * Profile key to link profiles
   */
  profileKey?: string;

  /**
   * Settings for the user
   */
  userID?: string;

  /**
   * Profile description
   */
  profileDescription?: string;

  /**
   * Image for the porfile
   */
  image?: string;

  /**
   * List of friends of the user
   */
  friends?: Array<string>;

  /**
   * Blocked ppl
   */
  blocked?: Array<string>;

  /**
   * friend requests reseived
   */
  friendRequests?: Array<string>;

  /**
   * Settings for the user
   */
  settings?: {};
}
