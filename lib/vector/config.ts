// lib/vector/config.ts
import { Index } from "@upstash/vector";

export const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export const VECTOR_CONFIG = {
  DIMENSIONS: 384, // Updated for MiniLM
  SIMILARITY_THRESHOLD: 0.3, // Lower threshold for MiniLM
  MAX_RESULTS: 50,
} as const;
