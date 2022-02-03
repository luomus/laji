import { browser, $, $$} from "protractor";
import { waitForInvisibility } from "../../helper";

const path = `observation/map?
  target=MX.29038&effectiveTag=INVASIVE_NO_EFFECT
  &informalTaxonGroupId=MVL.1161
  &administrativeStatusId=MX.finlex160_1997_appendix4_2021,MX.euInvasiveSpeciesList&redListStatusId=MX.iucnEX
  &countryId=ML.206&finnishMunicipalityId=ML.532&provinceId=ML.1245&elyCentreId=ML.1259&biogeographicalProvinceId=ML.251
  &area=asd&time=2022-01-01%2F&keyword=asd&collectionId=gbif-dataset:994fb34c-ba13-4768-a238-b1d3eb35c90d&typeOfOccurrenceId=MX.doesNotOccur
  &coordinates=63.250569:63.417915:25.523624:25.64792:WGS84:1&sourceId=KE.167,KE.3&recordBasis=PRESERVED_SPECIMEN&lifeStage=ADULT&sex=MALE
  &documentId=asd&recordQuality=EXPERT_VERIFIED&wild=WILD&teamMemberId=1795001&primaryHabitat=MKV.habitatM%5BMKV.habitatSpecificTypeV%5D
  &plantStatusCode=MY.plantStatusCodeL&sourceOfCoordinates=REPORTED_VALUE&finnish=true&invasive=false&typeSpecimen=true&hasDocumentMedia=true
  &hasGatheringMedia=true&hasUnitMedia=false&secured=true&unidentified=true&needsCheck=true&breedingSite=true&useIdentificationAnnotations=false
  &includeSubTaxa=false&annotated=true&individualCountMin=0&individualCountMax=1000&occurrenceCountFinlandMax=1000&coordinateAccuracyMax=1000
  &qualityIssues=BOTH&firstLoadedSameOrAfter=2022-01-01&loadedSameOrAfter=2022-01-01&season=0101%2F1218'
`;

describe('Observation list', () => {
  const spinners$ = $('laji-observation-result').$$('.spinner');

  beforeAll(async (done) => {
    await browser.get(path);
    for (const spinner$ of await spinners$) {
      await waitForInvisibility(spinner$);
    }
    done();
  });

  it("shouldn't get http status 400 from graphql", async (done) => {
    const browserLog = await browser.manage().logs().get('browser');
    const badRequests = browserLog.filter(entry => entry.message.includes('api/graphql') && entry.message.includes('400'));
    expect(badRequests.length).toEqual(0);
    done();
  });
});
