import type { INestApplication } from '@nestjs/common';
import type {
  DenoHttpServer,
  DenoCorsOptions,
  DenoStaticAssetsOptions,
} from './deno-http-options.interface.js';
import type { DenoRequest, DenoResponse } from '../adapters/deno-adapter.js';

/**
 * Interface for a NestJS application running on the Deno adapter
 */
export interface NestDenoApplication extends INestApplication {
  /**
   * Get the underlying Deno HTTP server
   */
  getHttpServer(): DenoHttpServer | undefined;

  /**
   * Enable CORS for the application
   * @param options CORS configuration options
   */
  enableCors(options?: DenoCorsOptions): this;

  /**
   * Serve static assets from a directory
   * @param path Path to the static assets directory
   * @param options Static assets options
   */
  useStaticAssets(path: string, options?: DenoStaticAssetsOptions): this;

  /**
   * Set a custom error handler
   * @param handler Error handler function
   */
  setErrorHandler(
    handler: (error: Error, req: DenoRequest, res: DenoResponse) => void,
  ): this;

  /**
   * Set a custom 404 handler
   * @param handler Not found handler function
   */
  setNotFoundHandler(
    handler: (req: DenoRequest, res: DenoResponse) => void,
  ): this;

  /**
   * Start listening for connections
   * @param port Port number to listen on
   * @param callback Callback when server starts
   */
  listen(port: number | string, callback?: () => void): Promise<void>;

  /**
   * Start listening for connections
   * @param port Port number to listen on
   * @param hostname Hostname to bind to
   * @param callback Callback when server starts
   */
  listen(
    port: number | string,
    hostname: string,
    callback?: () => void,
  ): Promise<void>;
}
