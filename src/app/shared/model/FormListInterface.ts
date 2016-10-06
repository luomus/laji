/**
 * Form list interface
 */
export interface FormListInterface {
  forms: {
    id: string;
    title: string;
    description: string;
    supportedLanguage: string[];
    category: string;
  }[];
  language: string;
}
