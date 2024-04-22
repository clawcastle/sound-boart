import { Span } from "@opentelemetry/api";

export class Command<T> {
  prefix: string;
  payload: T;
  tracing: CommandTelemetry;
  constructor(prefix: string, payload: T, span: Span) {
    this.prefix = prefix;
    this.payload = payload;
    this.tracing = { span };
  }
}

export type CommandTelemetry = {
  span: Span;
};
