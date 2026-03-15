declare module 'react-native-pure-jwt' {
  type JwtAlgorithm = 'HS256';

  interface JwtSignOptions {
    alg: JwtAlgorithm;
  }

  type JwtPayload = Record<string, string | number | boolean | null>;

  export const sign: (payload: JwtPayload, secret: string, options: JwtSignOptions) => Promise<string>;
}
