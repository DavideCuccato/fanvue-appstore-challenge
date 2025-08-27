import { z } from "zod";

const envSchema = z.object({
  // API Configuration
  API_CACHE_MAX_AGE: z.coerce.number().positive().default(300),
  API_CACHE_STALE_WHILE_REVALIDATE: z.coerce.number().positive().default(600),
  NEXT_PUBLIC_API_BASE_URL: z.string().default("/api/v1"),

  // Mock Data Configuration
  MOCK_DATA_COUNT: z.coerce.number().positive().max(10000).default(1000),
  MOCK_SUBMISSION_DATE_RANGE_DAYS: z.coerce
    .number()
    .positive()
    .max(365)
    .default(30),
  MOCK_UPDATE_DATE_RANGE_DAYS: z.coerce.number().positive().max(30).default(7),

  // Security Configuration
  CORS_ORIGIN: z.string().default("https://dashboard.fanvue.com"),
  PORT: z.coerce.number().positive().max(65535).default(3000),

  // Node Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      throw new Error(
        `Environment validation failed:\n${errorMessages}\n\nPlease check your .env.local file and ensure all required variables are set correctly.`,
      );
    }
    throw error;
  }
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
