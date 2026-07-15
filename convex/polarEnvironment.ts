export type PolarEnvironment = "production" | "sandbox";

export function polarEnvironment(): PolarEnvironment {
  const environment = process.env.POLAR_SERVER;

  if (environment !== "production" && environment !== "sandbox") {
    throw new Error("POLAR_SERVER must be explicitly set to production or sandbox");
  }

  return environment;
}
