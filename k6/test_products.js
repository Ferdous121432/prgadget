import { check } from "k6";
import http from "k6/http";

export let options = {
  scenarios: {
    constant_rate: {
      executor: "constant-arrival-rate",
      rate: __ENV.RATE ? parseInt(__ENV.RATE) : 5, // iterations per second (5 rps = 300/min)
      timeUnit: "1s",
      duration: __ENV.DURATION || "1m",
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.05"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const res = http.get(`${BASE_URL}/api/test/products`);
  check(res, { "status is 200": (r) => r.status === 200 });
}
