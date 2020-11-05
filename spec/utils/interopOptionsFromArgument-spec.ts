import { defaultOption, interopOptionsFromArgument } from '../../src/utils/interopOptionsFromArgument';

describe('interopOptionsFromArgument', () => {
  it('should support empty args', () => {
    expect(interopOptionsFromArgument([])).toEqual(defaultOption);
  });

  it('should support config object', () => {
    expect(interopOptionsFromArgument([{}])).toEqual(defaultOption);
    expect(interopOptionsFromArgument([{ autoFlush: true }])).toEqual({
      ...defaultOption,
      autoFlush: true,
    });
    expect(interopOptionsFromArgument([{ frameTimeFactor: 2 }])).toEqual({
      ...defaultOption,
      frameTimeFactor: 2,
    });
    expect(interopOptionsFromArgument([{ maxFrameValue: 2 }])).toEqual({
      ...defaultOption,
      maxFrameValue: 2,
    });
  });

  it('should support legacy spread argument', () => {
    expect(interopOptionsFromArgument([true])).toEqual({
      ...defaultOption,
      autoFlush: true,
    });
    expect(interopOptionsFromArgument([undefined, 2])).toEqual({
      ...defaultOption,
      frameTimeFactor: 2,
    });
    expect(interopOptionsFromArgument([undefined, undefined, 2])).toEqual({
      ...defaultOption,
      maxFrameValue: 2,
    });
  });
});
