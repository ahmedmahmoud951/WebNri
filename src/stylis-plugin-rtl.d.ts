declare module 'stylis' {
  export type Middleware = (element: unknown, index: number, children: unknown, callback: unknown) => unknown;
  export const prefixer: Middleware;
}

declare module 'stylis-plugin-rtl' {
  import type { Middleware } from 'stylis';
  const rtlPlugin: Middleware;
  export default rtlPlugin;
}

