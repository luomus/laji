import dotenv from 'dotenv';
import { components, operations } from 'projects/laji-api-client-b/generated/api';

export type MetadataProperty = components['schemas']['Property'];
export type MetadataAlt = components['schemas']['Alt'];
export type MetadataRangeValue = Pick<MetadataAlt, 'id' | 'value'>;

type PropertyAltResponse =
  operations['MetadataController_getPropertyAlt']['responses']['200']['content']['application/json'];
type AltResponse =
  operations['MetadataController_getAlt']['responses']['200']['content']['application/json'];

interface ApiConfig {
  apiBase: string;
  accessToken?: string;
}

interface Headers {
  'API-Version': '1';
  Authorization: string;
  'Accept-Language': 'en';
}

const getHeaders = (accessToken?: string): Headers | undefined => (accessToken ? {
  'API-Version': '1',
  'Accept-Language': 'en',
  Authorization: accessToken
} : undefined);

const getApiConfig = (): ApiConfig => {
  dotenv.config();
  const apiBase = process.env.API_BASE || 'https://dev.laji.fi/api';
  const accessToken = process.env.ACCESS_TOKEN;
  return { apiBase, accessToken };
};

const getFetch = () => (globalThis as any).fetch as ((input: string, init?: any) => Promise<any>) | undefined;

const fetchJson = async (subpath: string) => {
  const fetchFn = getFetch();
  const { apiBase, accessToken } = getApiConfig();
  if (!fetchFn) {
    console.warn('Global fetch is not available');
    return null;
  }
  const url = `${apiBase}/${subpath}`;
  const headers = getHeaders(accessToken);

  try {
    const response = await fetchFn(url, { headers });
    if (!response.ok) {
      console.warn(`Fetch failed for: ${subpath}, status: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (err) {
    console.warn(`Fetch error for: ${subpath}:`, err);
    return null;
  }
};

export const getClassPropertiesFetcher = () => {
  const cache = new Map<string, MetadataProperty[] | null>();

  return async (className: string): Promise<MetadataProperty[] | null> => {
    if (cache.has(className)) {
      return cache.get(className)!;
    }
    const json = await fetchJson(`metadata/classes/${encodeURIComponent(className)}/properties`);
    if (!json) {
      console.warn(`Metadata class fetch failed: ${className}.`);
      cache.set(className, null);
      return null;
    }
    if (!Array.isArray(json?.results)) {
      console.warn(`Unexpected metadata response for class ${className}.`);
      cache.set(className, null);
      return null;
    }
    cache.set(className, json.results as MetadataProperty[]);
    return cache.get(className)!;
  };
};

export const getPropertyAltFetcher = () => {
  const cache = new Map<string, MetadataAlt[] | null>();

  return async (property: string): Promise<MetadataAlt[] | null> => {
    if (cache.has(property)) {
      return cache.get(property)!;
    }
    const json = await fetchJson(`metadata/properties/${encodeURIComponent(property)}/alt`) as PropertyAltResponse | null;
    if (!json) {
      console.warn(`Metadata alt fetch failed for property ${property}.`);
      cache.set(property, null);
      return null;
    }
    if (!Array.isArray(json?.results)) {
      console.warn(`Unexpected metadata alt response for property ${property}.`);
      cache.set(property, null);
      return null;
    }
    cache.set(property, json.results as MetadataAlt[]);
    return cache.get(property)!;
  };
};

export const getAltValuesFetcher = () => {
  const cache = new Map<string, MetadataAlt[] | null>();

  return async (alt: string): Promise<MetadataAlt[] | null> => {
    if (cache.has(alt)) {
      return cache.get(alt)!;
    }
    const json = await fetchJson(`metadata/alts/${encodeURIComponent(alt)}`) as AltResponse | null;
    if (!json) {
      console.warn(`Metadata alt fetch failed for alt ${alt}.`);
      cache.set(alt, null);
      return null;
    }
    if (!Array.isArray(json?.results)) {
      console.warn(`Unexpected metadata alt response for alt ${alt}.`);
      cache.set(alt, null);
      return null;
    }
    cache.set(alt, json.results as MetadataAlt[]);
    return cache.get(alt)!;
  };
};

export const getRangeValuesFetcher = () => {
  const cache = new Map<string, MetadataRangeValue[] | null>();

  return async (range: string): Promise<MetadataRangeValue[] | null> => {
    if (cache.has(range)) {
      return cache.get(range)!;
    }
    const json = await fetchJson(`metadata/ranges/${encodeURIComponent(range)}`);
    if (!json) {
      console.warn(`Metadata range fetch failed for range ${range}.`);
      cache.set(range, null);
      return null;
    }
    if (!Array.isArray(json)) {
      console.warn(`Unexpected metadata range response for range ${range}.`);
      cache.set(range, null);
      return null;
    }
    cache.set(range, json as MetadataRangeValue[]);
    return cache.get(range)!;
  };
};
