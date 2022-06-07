export type Lang = 'fi' | 'en' | 'sv';

export const i18nMap: {[key: string]: {[key in Lang]: string}} = {
  screenOne: {
    fi: 'ex-12',
    en: 'ex-16',
    sv: 'ex-14'
  }
};
