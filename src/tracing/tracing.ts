import { NodeSDK } from "@opentelemetry/sdk-node";
import { HoneycombSDK } from "@honeycombio/opentelemetry-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";

export const tracingSdk: () => NodeSDK = () => {
  if (process.env.HONEYCOMB_API_KEY) {
    return new HoneycombSDK({
      instrumentations: [],
      serviceName: "sound-boart",
      apiKey: process.env.HONEYCOMB_API_KEY,
    });
  } else {
    return new NodeSDK({
      traceExporter: new ConsoleSpanExporter(),
    });
  }
};
