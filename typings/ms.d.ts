declare module 'ms' {
  interface Options {
    long?: boolean;
  }

  interface Ms {
    (val: string): number;
    (val: number, options?: Options): string;
  }

  var ms: Ms;
  export = ms;
}
