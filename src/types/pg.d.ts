declare module 'pg' {
  export class Pool {
    constructor(config?: any);
  }

  const pg: {
    Pool: typeof Pool;
  };

  export default pg;
}
