import { NodeSDK } from "@opentelemetry/sdk-node";
import { HoneycombSDK } from "@honeycombio/opentelemetry-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

export const tracingSdk: NodeSDK = new HoneycombSDK({
  instrumentations: [],
  serviceName: "sound-boart",
  apiKey: process.env.HONEYCOMB_API_KEY,
});
