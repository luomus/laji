import { IucnStatusPipe } from './iucn-status.pipe';

describe('IucnStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new IucnStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
