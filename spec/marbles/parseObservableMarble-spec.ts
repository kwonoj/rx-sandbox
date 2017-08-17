import { expect } from 'chai';
import { parseObservableMarble } from '../../src/marbles/parseObservableMarble';

describe('parseObservableMarble', () => {
  it('should not allow unsubscription token', () => {
    const marble = '----!';

    expect(() => parseObservableMarble(marble)).to.throw();
  });

  it('should parse timeframe', () => {

  });

  it('should parse value literal', () => {

  });

  it('should parse value literal with custom value', () => {

  });

  it('should allow whitespace', () => {

  });

  it('should parse simultaneous value', () => {

  });

  it('should parse complete', () => {

  });
});
