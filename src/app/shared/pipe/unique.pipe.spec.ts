import { UniquePipe } from './unique.pipe';

describe('UniquePipe', () => {
  it('create an instance', () => {
    const pipe = new UniquePipe();
    expect(pipe).toBeTruthy();
  });
});
