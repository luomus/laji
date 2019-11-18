/* tslint:disable */
export interface DwETL_MediaObject {
  mediaType?: 'IMAGE' | 'AUDIO' | 'VIDEO';
  fullURL?: string;
  thumbnailURL?: string;
  author?: string;
  caption?: string;
  licenseId?: string;
  licenseAbbreviation?: string;
  copyrightOwner?: string;
  squareThumbnailURL?: string;
}
