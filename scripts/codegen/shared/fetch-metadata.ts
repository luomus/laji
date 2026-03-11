import dotenv from 'dotenv';
import { components } from 'projects/laji-api-client-b/generated/api';

export type MetadataProperty = components['schemas']['Property'];

const getMetadataApiConfig = () => {
  dotenv.config();
  const apiBase = process.env.API_BASE || 'https://dev.laji.fi/api';
  const accessToken = process.env.ACCESS_TOKEN;
  return { apiBase, accessToken };
};

const getFetch = () => (globalThis as any).fetch as ((input: string, init?: any) => Promise<any>) | undefined;

export const getClassPropertiesFetcher = () => {
  const { apiBase, accessToken } = getMetadataApiConfig();
  const fetchFn = getFetch();
  const cache = new Map<string, MetadataProperty[] | null>();

  return async (className: string): Promise<MetadataProperty[] | null> => {
    if (cache.has(className)) {
      return cache.get(className)!;
    }
    if (!fetchFn) {
      console.warn('Global fetch is not available. Metadata labels will be skipped.');
      cache.set(className, null);
      return null;
    }
    const url = `${apiBase.replace(/\/$/, '')}/metadata/classes/${encodeURIComponent(className)}/properties`;
    const headers = accessToken ? { Authorization: accessToken } : undefined;
    try {
      const response = await fetchFn(url, { headers });
      if (!response.ok) {
        console.warn(`Metadata fetch failed for class ${className}: ${response.status} ${response.statusText}`);
        cache.set(className, null);
        return null;
      }
      const json = await response.json();
      if (!Array.isArray(json?.results)) {
        console.warn(`Unexpected metadata response for class ${className}.`);
        cache.set(className, null);
        return null;
      }
      cache.set(className, json.results as MetadataProperty[]);
      return cache.get(className)!;
    } catch (err) {
      console.warn(`Metadata fetch error for class ${className}:`, err);
      cache.set(className, null);
      return null;
    }
  };
};
