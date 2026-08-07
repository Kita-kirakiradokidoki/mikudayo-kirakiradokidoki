import type { IncomingMessage, ServerResponse } from 'node:http'

export declare function steamApi(options?: { basePath?: string }): (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
) => void | Promise<void>
