// packages/ponder/src/api/index.ts
import { Hono } from "hono";
// import { cors } from "hono/cors";
import { db } from "ponder:api";
import {
  cohort,
  builder,
  admin,
  withdrawEvent,
  withdrawRequest,
  cohortState,
} from "ponder:schema";
import { eq, and, desc, like, or, sql } from "@ponder/core";

const app = new Hono();

// Enable CORS for frontend
app.use("/*");

// Get all cohorts across all chains
app.get("/cohorts", async (c) => {
  const chainId = c.req.query("chainId");
  const cohortName = c.req.query("cohort");
  const userAddress = c.req.query("address");

  let conditions = [];

  if (chainId) {
    conditions.push(eq(cohort.chainId, Number(chainId)));
  }

  if (cohortName) {
    conditions.push(like(cohort.name, `%${cohortName}%`));
  }

  let query = db.select().from(cohort);

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const cohorts = await query.orderBy(desc(cohort.createdAt));

  // If user address is provided, get their role in each cohort
  if (userAddress) {
    const normalizedAddress = userAddress.toLowerCase();

    // Get admin roles
    const adminRoles = await db
      .select()
      .from(admin)
      .where(
        and(
          eq(admin.adminAddress, normalizedAddress as `0x${string}`),
          eq(admin.isActive, true)
        )
      );

    // Get builder roles
    const builderRoles = await db
      .select()
      .from(builder)
      .where(
        and(
          eq(builder.builderAddress, normalizedAddress as `0x${string}`),
          eq(builder.isActive, true)
        )
      );

    // Enhance cohorts with user roles
    const cohortsWithRoles = cohorts.map((cohort) => {
      const isAdmin = adminRoles.some(
        (a) => a.cohortAddress === cohort.address
      );
      const isBuilder = builderRoles.some(
        (b) => b.cohortAddress === cohort.address
      );

      return {
        ...cohort,
        role: isAdmin ? "ADMIN" : isBuilder ? "BUILDER" : null,
      };
    });

    return c.json({ cohorts: cohortsWithRoles });
  }

  return c.json({ cohorts });
});

// Get cohort data with builders and admins
app.get("/cohort/:address", async (c) => {
  const address = c.req.param("address").toLowerCase();

  const [cohortData, builders, admins, state] = await Promise.all([
    db
      .select()
      .from(cohort)
      .where(eq(cohort.address, address as `0x${string}`))
      .limit(1),
    db
      .select()
      .from(builder)
      .where(
        and(
          eq(builder.cohortAddress, address as `0x${string}`),
          eq(builder.isActive, true)
        )
      ),
    db
      .select()
      .from(admin)
      .where(
        and(
          eq(admin.cohortAddress, address as `0x${string}`),
          eq(admin.isActive, true)
        )
      ),
    db
      .select()
      .from(cohortState)
      .where(eq(cohortState.cohortAddress, address as `0x${string}`))
      .limit(1),
  ]);

  if (cohortData.length === 0) {
    return c.json({ error: "Cohort not found" }, 404);
  }

  return c.json({
    cohort: cohortData[0],
    builders,
    admins,
    state: state[0] || null,
  });
});

// Get withdraw events and requests
app.get("/cohort/:address/withdrawals", async (c) => {
  const address = c.req.param("address").toLowerCase();
  const builderAddress = c.req.query("builder")?.toLowerCase();

  let eventsConditions = [
    eq(withdrawEvent.cohortAddress, address as `0x${string}`),
  ];
  let requestsConditions = [
    eq(withdrawRequest.cohortAddress, address as `0x${string}`),
  ];

  if (builderAddress) {
    eventsConditions.push(
      eq(withdrawEvent.builderAddress, builderAddress as `0x${string}`)
    );
    requestsConditions.push(
      eq(withdrawRequest.builderAddress, builderAddress as `0x${string}`)
    );
  }

  const [events, requests] = await Promise.all([
    db
      .select()
      .from(withdrawEvent)
      .where(and(...eventsConditions))
      .orderBy(desc(withdrawEvent.timestamp)),
    db
      .select()
      .from(withdrawRequest)
      .where(and(...requestsConditions))
      .orderBy(desc(withdrawRequest.requestTime)),
  ]);

  return c.json({ events, requests });
});

// Get user's cohorts (where they are admin or builder)
app.get("/user/:address/cohorts", async (c) => {
  const userAddress = c.req.param("address").toLowerCase();

  // Get cohorts where user is admin
  const adminCohorts = await db
    .select({
      cohort: cohort,
      role: sql<string>`'ADMIN'`,
    })
    .from(cohort)
    .innerJoin(admin, eq(admin.cohortAddress, cohort.address))
    .where(
      and(
        eq(admin.adminAddress, userAddress as `0x${string}`),
        eq(admin.isActive, true)
      )
    );

  // Get cohorts where user is builder
  const builderCohorts = await db
    .select({
      cohort: cohort,
      role: sql<string>`'BUILDER'`,
    })
    .from(cohort)
    .innerJoin(builder, eq(builder.cohortAddress, cohort.address))
    .where(
      and(
        eq(builder.builderAddress, userAddress as `0x${string}`),
        eq(builder.isActive, true)
      )
    );

  // Combine and sort by creation date
  const allCohorts = [...adminCohorts, ...builderCohorts].sort(
    (a, b) => Number(b.cohort.createdAt) - Number(a.cohort.createdAt)
  );

  return c.json({ cohorts: allCohorts });
});

// Get pending withdrawal requests for admin
app.get("/admin/:address/pending-requests", async (c) => {
  const adminAddress = c.req.param("address").toLowerCase();

  // First get all cohorts where user is admin
  const adminCohorts = await db
    .select()
    .from(admin)
    .where(
      and(
        eq(admin.adminAddress, adminAddress as `0x${string}`),
        eq(admin.isActive, true)
      )
    );

  const cohortAddresses = adminCohorts.map((a) => a.cohortAddress);

  if (cohortAddresses.length === 0) {
    return c.json({ requests: [] });
  }

  // Get all pending requests for those cohorts
  const pendingRequests = await db
    .select()
    .from(withdrawRequest)
    .where(
      and(
        sql`${withdrawRequest.cohortAddress} IN ${cohortAddresses}`,
        eq(withdrawRequest.status, "pending")
      )
    )
    .orderBy(desc(withdrawRequest.requestTime));

  return c.json({ requests: pendingRequests });
});

// // Health check endpoint
// app.get("/health", async (c) => {
//   return c.json({ status: "ok", timestamp: Date.now() });
// });

// GraphQL endpoint info
app.get("/graphql-info", async (c) => {
  return c.json({
    message: "GraphQL endpoint available at /graphql",
    playground: "http://localhost:42069/graphql",
  });
});

export default app;
