export interface ILogger {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  log(message: string, meta?: any): void;
}
