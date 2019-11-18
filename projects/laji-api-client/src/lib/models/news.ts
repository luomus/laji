/* tslint:disable */
export interface News {
  id: string;
  featuredImage: string;
  external: boolean;
  externalURL?: string;
  title: string;
  content?: string;

  /**
   * timestamp for when the news was posted
   */
  posted: string;

  /**
   * timestamp for when the news was edited
   */
  modified?: string;
  tag: string;
}
