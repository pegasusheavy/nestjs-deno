/**
 * Options for configuring the Deno HTTP server
 */
export interface DenoHttpOptions {
  /**
   * The port to listen on
   */
  port?: number;

  /**
   * The hostname to bind to
   */
  hostname?: string;

  /**
   * TLS certificate configuration
   */
  cert?: string;

  /**
   * TLS key configuration
   */
  key?: string;

  /**
   * Handler for when the server starts listening
   */
  onListen?: (params: { hostname: string; port: number }) => void;

  /**
   * Signal for aborting the server
   */
  signal?: AbortSignal;

  /**
   * Enable HTTP/2
   */
  alpnProtocols?: string[];
}

/**
 * Represents a Deno HTTP server instance
 */
export interface DenoHttpServer {
  /**
   * The port the server is listening on
   */
  port: number;

  /**
   * The hostname the server is bound to
   */
  hostname: string;

  /**
   * Promise that resolves when the server finishes
   */
  finished: Promise<void>;

  /**
   * Reference to the underlying Deno server
   */
  ref(): void;

  /**
   * Unreference the server
   */
  unref(): void;

  /**
   * Shutdown the server gracefully
   */
  shutdown(): Promise<void>;
}

/**
 * CORS options for the Deno adapter
 */
export interface DenoCorsOptions {
  origin?: string | string[] | boolean | ((origin: string) => boolean | string);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

/**
 * Static assets options
 */
export interface DenoStaticAssetsOptions {
  prefix?: string;
  index?: string | boolean;
  redirect?: boolean;
  maxAge?: number;
  immutable?: boolean;
  dotfiles?: 'allow' | 'deny' | 'ignore';
  etag?: boolean;
  lastModified?: boolean;
}

/**
 * Body parser options
 */
export interface DenoBodyParserOptions {
  limit?: number | string;
  type?: string | string[];
}
