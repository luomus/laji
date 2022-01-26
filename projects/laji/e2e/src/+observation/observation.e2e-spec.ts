import { browser, $, $$} from "protractor";
import { waitForInvisibility } from "../../helper";

describe('Observation list', () => {
  const spinners$ = $('laji-observation-result').$$('.spinner');

  beforeAll(async (done) => {
    await browser.get('observation/list?provinceId=ML.1245');
    for (const spinner$ of await spinners$) {
      await waitForInvisibility(spinner$);
    }
    done();
  });

  it("shouldn't get http status 400 from graphql", async (done) => {
    const browserLog = await browser.manage().logs().get('browser');
    const badRequests = browserLog.filter(entry => entry.message.includes('api/graphql') && entry.message.includes('400'))
    expect(badRequests.length).toEqual(0);
    done();
  });
});
