import gql from 'graphql-tag';

export interface IBaseQuery {
  person: {
    id: string;
    fullName: string;
  };
  classes: {
    id: string;
    label: string;
  }[];
  properties: {
    id: string;
    label: string;
  }[];
  alts: {
    id: string;
    options: {
      id: string;
      label: string;
    }[]
  }[];
  information: {
    id: string;
    title: string;
    children: {
      id: string;
      title: string;
      children: {
        id: string;
        title: string;
      }[]
    }[]
  };
}

export const BASE_QUERY = gql`
    query($lang: String = "fi", $personToken: String = "") {
        person(personToken: $personToken) {
            id,
            fullName
        }
        classes(lang: $lang) {
            id: class,
            label
        }
        properties(lang: $lang) {
            id: property,
            label
        }
        alts(lang: $lang) {
            id: alt
            options {
                id
                label: value
            }
        }
        information(lang: $lang) {
            id,
            title,
            children {
                id,
                title,
                children {
                    id,
                    title
                }
            }
        }
    }
`;
