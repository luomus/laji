export type DownloadRequestType = 'apiKey' | 'basic';

export type DownloadRequestResponse = DownloadRequest | DownloadRequestNotFound;

export interface DownloadRequest {
  id: string;
  requested: string;
  downloadType: string;
  source?: string;
  personId?: string;
  dataUsePurpose?: string;
  approximateMatches?: number;
  filters?: {[key: string]: any}[];
  filterDescriptions?: {[lang: string]: {label: string; value: string}[]};
  privateLink?: {[lang: string]: string}[];
  publicLink?: {[lang: string]: string}[];
  collectionId?: string[];
  collections?: {id: string}[];
  collectionSearch?: string[];
  rootCollections?: string[];
  apiKeyExpires?: string;
  apiKey?: string;
  publicDownload?: boolean;
  found: true;
}

export interface DownloadRequestNotFound {
  found: false;
}

export function isDownloadRequest(val: DownloadRequestResponse): val is DownloadRequest {
  return val.found;
}

export function asDownloadRequest(val: DownloadRequestResponse): DownloadRequest {
  return val as DownloadRequest;
}
