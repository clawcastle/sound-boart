import { Span } from "@opentelemetry/api";

export class Command<T> {
  payload: T;
  tracing: CommandTelemetry;
  constructor(payload: T, span: Span) {
    this.payload = payload;
    this.tracing = { span };
  }
}

export type CommandTelemetry = {
  span: Span;
};
