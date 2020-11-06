/**
 * To pick up specific overloaded fn signature when calculate return type signatures for creating test scheduler
 */
type ReturnTypeWithArgs<T extends (...args: any[]) => any, ARGS_T> = Extract<
  T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
  }
    ? [A1, R1] | [A2, R2] | [A3, R3] | [A4, R4]
    : T extends { (...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3 }
    ? [A1, R1] | [A2, R2] | [A3, R3]
    : T extends { (...args: infer A1): infer R1; (...args: infer A2): infer R2 }
    ? [A1, R1] | [A2, R2]
    : T extends { (...args: infer A1): infer R1 }
    ? [A1, R1]
    : never,
  [ARGS_T, any]
>[1];

export { ReturnTypeWithArgs };
