import assert from "node:assert/strict";
import test from "node:test";
import { gatewayMode, PaymentConfigurationError } from "../src/lib/payment";

const paymentEnvironment = ["NODE_ENV", "PAYMENT_MODE", "ZARINPAL_MERCHANT_ID"] as const;
const environment = process.env as Record<string, string | undefined>;

function restore(values: Record<string, string | undefined>) {
  for (const key of paymentEnvironment) {
    if (values[key] === undefined) delete environment[key];
    else environment[key] = values[key];
  }
}

test("payment mode is fail-closed in production without a configured gateway", () => {
  const previous = Object.fromEntries(paymentEnvironment.map((key) => [key, process.env[key]]));
  try {
    environment.NODE_ENV = "production";
    delete environment.PAYMENT_MODE;
    delete environment.ZARINPAL_MERCHANT_ID;
    assert.throws(() => gatewayMode(), PaymentConfigurationError);

    environment.PAYMENT_MODE = "demo";
    assert.equal(gatewayMode(), "demo");

    environment.PAYMENT_MODE = "zarinpal";
    environment.ZARINPAL_MERCHANT_ID = "a".repeat(32);
    assert.equal(gatewayMode(), "zarinpal");
  } finally {
    restore(previous);
  }
});
