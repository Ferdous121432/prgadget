# k6 load tests

This folder contains a simple k6 script to load-test the test products API endpoint.

Run examples:

Run at 5 req/s (300 requests per minute) for 1 minute against localhost:

```bash
RATE=5 DURATION=1m BASE_URL=http://localhost:3000 k6 run k6/test_products.js
```

Save results to JSON:

```bash
RATE=5 DURATION=1m BASE_URL=http://localhost:3000 k6 run --out json=out.json k6/test_products.js
```

Adjust `RATE` (iterations/sec) and `DURATION` as needed.
