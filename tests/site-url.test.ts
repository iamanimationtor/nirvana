import assert from "node:assert/strict";
import test from "node:test";
import { appBaseUrl } from "../src/lib/security";

const keys = ["APP_URL", "CONTEXT", "DEPLOY_PRIME_URL"] as const;
const environment = process.env as Record<string, string | undefined>;

function withEnvironment(values: Record<string, string | undefined>, callback: () => void) {
  const previous = Object.fromEntries(keys.map((key) => [key, environment[key]]));
  try {
    for (const key of keys) {
      if (values[key] === undefined) delete environment[key];
      else environment[key] = values[key];
    }
    callback();
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete environment[key];
      else environment[key] = previous[key];
    }
  }
}

const request = new Request("https://preview.example.test/api/checkout", {
  headers: { host: "preview.example.test", "x-forwarded-proto": "https" },
});

test("deploy-preview callbacks stay on the Netlify preview URL", () => {
  withEnvironment({ APP_URL: "https://nirvana3d.example", CONTEXT: "deploy-preview", DEPLOY_PRIME_URL: "https://deploy-preview-3.example/" }, () => {
    assert.equal(appBaseUrl(request), "https://deploy-preview-3.example");
  });
});

test("production callbacks use the configured canonical application URL", () => {
  withEnvironment({ APP_URL: "https://nirvana3d.example/", CONTEXT: "production", DEPLOY_PRIME_URL: "https://preview.example" }, () => {
    assert.equal(appBaseUrl(request), "https://nirvana3d.example");
  });
});
