import { z } from "zod";

/**
 * Zod schema for validating an Insight object.
 *
 * @property {number} id - Unique identifier for the insight. Must be a non-negative integer.
 * @property {number} brand - Identifier for the associated brand. Must be a non-negative integer.
 * @property {Date} createdAt - Timestamp indicating when the insight was created.
 * @property {string} text - The content or message of the insight.
 */
export const Insight = z.object({
  id: z.number().int().min(0),
  brand: z.number().int().min(0),
  createdAt: z.date(),
  text: z.string(),
});

export type Insight = z.infer<typeof Insight>;
