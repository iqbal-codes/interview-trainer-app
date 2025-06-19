declare module 'next-ws' {
  import { WebSocket } from 'ws';
  import { IncomingMessage as HttpIncomingMessage, ServerResponse as HttpServerResponse } from 'http';
  
  export type IncomingMessage = HttpIncomingMessage;
  export type ServerResponse = HttpServerResponse;
  
  export interface Router {
    on(event: 'connection', listener: (ws: WebSocket, req: IncomingMessage) => void): this;
    handler: (request: Request) => Promise<Response>;
  }
  
  export function createRouter(): Router;
} 