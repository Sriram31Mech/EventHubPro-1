declare module 'express' {
  export interface Express {
    use: Function;
    get: Function;
    post: Function;
    put: Function;
    delete: Function;
  }

  export interface Request {
    headers: Record<string, string>;
    body: any;
    params: Record<string, string>;
    query: Record<string, string>;
    user?: {
      _id: string;
      email: string;
      role: string;
    };
  }

  export interface Response {
    status(code: number): Response;
    json(data: any): void;
  }
}

declare module 'node-fetch' {
  export interface Response {
    ok: boolean;
    status: number;
    json(): Promise<any>;
  }
  
  export default function fetch(url: string, init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<Response>;
}

declare module 'bcrypt' {
  export function hash(data: string, saltRounds: number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secret: string, options?: { expiresIn?: string }): string;
  export function verify(token: string, secret: string, callback: (error: any, decoded: any) => void): void;
}

declare module 'multer' {
  interface Options {
    storage?: any;
    limits?: {
      fileSize?: number;
    };
    fileFilter?: (req: any, file: any, callback: (error: Error | null, acceptFile: boolean) => void) => void;
  }

  interface Multer {
    single(fieldName: string): (req: any, res: any, next: any) => void;
    diskStorage(options: {
      destination: (req: any, file: any, cb: (error: Error | null, destination: string) => void) => void;
      filename: (req: any, file: any, cb: (error: Error | null, filename: string) => void) => void;
    }): any;
    memoryStorage(): any;
  }

  const multer: (options?: Options) => Multer;
  export default multer;
}

declare module 'http' {
  import { Express } from 'express';
  export interface Server {}
  export function createServer(app: Express): Server;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET?: string;
    }
  }
} 