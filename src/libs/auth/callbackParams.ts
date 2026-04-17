import { z } from "zod";

// Zod schema for the OAuth callback query string.
// Either `code` (success path) OR `error` (failure path) is expected; never both.
const CallbackParamsSchema = z
  .object({
    code: z.string().min(1).optional(),
    state: z.string().optional(),
    next: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  })
  .strip();

export type CallbackParams = z.infer<typeof CallbackParamsSchema>;

export function parseCallbackParams(searchParams: URLSearchParams): CallbackParams {
  const obj: Record<string, string> = {};
  for (const [key, value] of searchParams) obj[key] = value;
  const parsed = CallbackParamsSchema.safeParse(obj);
  return parsed.success ? parsed.data : {};
}
