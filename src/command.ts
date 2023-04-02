import { Span } from "@opentelemetry/api";

export class Command<T> {
  payload: T;
  telemetry: CommandTelemetry;
  constructor(payload: T, span: Span) {
    this.payload = payload;
    this.telemetry = { span };
  }
}

export type CommandTelemetry = {
  span: Span;
};
