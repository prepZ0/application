import { PistonClient, createPistonClient } from "@placementhub/piston-client";
import { EXECUTION_LIMITS } from "@placementhub/utils";

/**
 * Piston client singleton
 *
 * Configured with:
 * - Custom base URL from environment
 * - Default timeout and memory limits
 */

let pistonClient: PistonClient | null = null;

export function getPistonClient(): PistonClient {
  if (!pistonClient) {
    pistonClient = createPistonClient({
      baseUrl: process.env.PISTON_URL || "https://emkc.org/api/v2/piston",
      defaultTimeout: EXECUTION_LIMITS.DEFAULT_TIMEOUT,
      defaultMemoryLimit: EXECUTION_LIMITS.DEFAULT_MEMORY,
    });
  }
  return pistonClient;
}

export { PistonClient };
