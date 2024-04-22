import { Span } from "@opentelemetry/api";

export interface CommandContext {
  prefix: string;
  serverId: string;
  commandParts: string[];
}

export class Command<T> {
  payload: T;
  context: CommandContext;
  span?: Span;
  
  constructor(payload: T, commandContext: CommandContext, span: Span | undefined = undefined) {
    this.payload = payload;
    this.context = commandContext;
    this.span = span;
  }

  withSpan(span: Span): Command<T> {
    return new Command(this.payload, this.context, span);
  }
}
