import { SandboxOption } from '../interfaces/SandboxOption';

const defaultOption = {
  autoFlush: false,
  frameTimeFactor: 1,
  maxFrameValue: 1000,
  flushWithAsyncTick: false,
};

const interopOptionsFromArgument = (args: Array<any>): SandboxOption => {
  if (args.length === 0) {
    return defaultOption;
  }

  // old interface not using options object
  if (args.length > 1 || typeof args[0] === 'boolean') {
    return {
      autoFlush: args[0] ?? defaultOption.autoFlush,
      frameTimeFactor: args[1] ?? defaultOption.frameTimeFactor,
      maxFrameValue: args[2] ?? defaultOption.maxFrameValue,
      flushWithAsyncTick: false,
    } as any;
  }

  return {
    ...defaultOption,
    ...args[0],
  };
};

export { defaultOption, interopOptionsFromArgument };
