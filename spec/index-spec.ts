import { expect } from 'chai';
import * as idx from '../src/index';

describe('index', () => {
  it('should export', () => {
    expect(idx).to.have.property('rxSandbox');
  });
});
