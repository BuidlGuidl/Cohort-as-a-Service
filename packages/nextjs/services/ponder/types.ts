export type {
  PonderCohort,
  PonderBuilder,
  PonderAdmin,
  PonderCohortState,
  PonderWithdrawEvent,
  PonderWithdrawRequest,
} from "./client";

export type CohortWithRole = import("./client").PonderCohort & {
  role?: "ADMIN" | "BUILDER";
};
