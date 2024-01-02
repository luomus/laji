export const getAddressWithLang = (page: string, lang?: 'fi' | 'sv' | 'en'): string =>
  ((lang && lang !== 'fi') ? '/' + lang : '') + page;
