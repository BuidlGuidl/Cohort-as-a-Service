import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "ponder:api";
import {
  cohort,
  builder,
  admin,
  withdrawEvent,
  withdrawRequest,
  cohortState,
} from "ponder:schema";
import { sql } from "@ponder/core";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

const serializeBigInt = (obj: any): any => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

app.get("/cohorts", async (c) => {
  const chainId = c.req.query("chainId");
  const cohortName = c.req.query("cohort");
  const userAddress = c.req.query("address");

  try {
    let query = db.select().from(cohort);

    if (chainId) {
      query = query.where(sql`${cohort.chainId} = ${Number(chainId)}`);
    }

    if (cohortName) {
      query = query.where(sql`${cohort.name} LIKE ${"%" + cohortName + "%"}`);
    }

    const cohorts = await query.orderBy(sql`${cohort.createdAt} DESC`);

    if (userAddress) {
      const normalizedAddress = userAddress.toLowerCase();

      const adminRoles = await db
        .select()
        .from(admin)
        .where(sql`${admin.adminAddress} = ${normalizedAddress}`)
        .where(sql`${admin.isActive} = true`);

      const builderRoles = await db
        .select()
        .from(builder)
        .where(sql`${builder.builderAddress} = ${normalizedAddress}`)
        .where(sql`${builder.isActive} = true`);

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

      return c.json({ cohorts: serializeBigInt(cohortsWithRoles) });
    }

    return c.json({ cohorts: serializeBigInt(cohorts) });
  } catch (error) {
    console.error("Error fetching cohorts:", error);
    return c.json({ error: `Failed to fetch cohorts ${error}` }, 500);
  }
});

app.get("/cohort/:address", async (c) => {
  const address = c.req.param("address").toLowerCase();

  try {
    const [cohortData, builders, admins, state] = await Promise.all([
      db
        .select()
        .from(cohort)
        .where(sql`${cohort.address} = ${address}`)
        .limit(1),
      db
        .select()
        .from(builder)
        .where(sql`${builder.cohortAddress} = ${address}`)
        .where(sql`${builder.isActive} = true`),
      db
        .select()
        .from(admin)
        .where(sql`${admin.cohortAddress} = ${address}`)
        .where(sql`${admin.isActive} = true`),
      db
        .select()
        .from(cohortState)
        .where(sql`${cohortState.cohortAddress} = ${address}`)
        .limit(1),
    ]);

    if (cohortData.length === 0) {
      return c.json({ error: "Cohort not found" }, 404);
    }

    return c.json({
      cohort: serializeBigInt(cohortData[0]),
      builders: serializeBigInt(builders),
      admins: serializeBigInt(admins),
      state: state[0] ? serializeBigInt(state[0]) : null,
    });
  } catch (error) {
    console.error("Error fetching cohort data:", error);
    return c.json({ error: "Failed to fetch cohort data" }, 500);
  }
});

app.get("/cohort/:address/withdrawals", async (c) => {
  const address = c.req.param("address").toLowerCase();
  const builderAddress = c.req.query("builder")?.toLowerCase();

  try {
    let eventsQuery = db
      .select()
      .from(withdrawEvent)
      .where(sql`${withdrawEvent.cohortAddress} = ${address}`);

    let requestsQuery = db
      .select()
      .from(withdrawRequest)
      .where(sql`${withdrawRequest.cohortAddress} = ${address}`);

    if (builderAddress) {
      eventsQuery = eventsQuery.where(
        sql`${withdrawEvent.builderAddress} = ${builderAddress}`
      );
      requestsQuery = requestsQuery.where(
        sql`${withdrawRequest.builderAddress} = ${builderAddress}`
      );
    }

    const [events, requests] = await Promise.all([
      eventsQuery.orderBy(sql`${withdrawEvent.timestamp} DESC`),
      requestsQuery.orderBy(sql`${withdrawRequest.requestTime} DESC`),
    ]);

    return c.json({
      events: serializeBigInt(events),
      requests: serializeBigInt(requests),
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return c.json({ error: "Failed to fetch withdrawals" }, 500);
  }
});

app.get("/user/:address/cohorts", async (c) => {
  const userAddress = c.req.param("address").toLowerCase();

  try {
    const adminCohorts = await db
      .select({
        cohort: cohort,
        role: sql<string>`'ADMIN'`,
      })
      .from(cohort)
      .innerJoin(admin, sql`${admin.cohortAddress} = ${cohort.address}`)
      .where(sql`${admin.adminAddress} = ${userAddress}`)
      .where(sql`${admin.isActive} = true`);

    const builderCohorts = await db
      .select({
        cohort: cohort,
        role: sql<string>`'BUILDER'`,
      })
      .from(cohort)
      .innerJoin(builder, sql`${builder.cohortAddress} = ${cohort.address}`)
      .where(sql`${builder.builderAddress} = ${userAddress}`)
      .where(sql`${builder.isActive} = true`);

    const allCohorts = [...adminCohorts, ...builderCohorts].sort(
      (a, b) => Number(b.cohort.createdAt) - Number(a.cohort.createdAt)
    );

    return c.json({ cohorts: serializeBigInt(allCohorts) });
  } catch (error) {
    console.error("Error fetching user cohorts:", error);
    return c.json({ error: "Failed to fetch user cohorts" }, 500);
  }
});

app.get("/admin/:address/pending-requests", async (c) => {
  const adminAddress = c.req.param("address").toLowerCase();

  try {
    const adminCohorts = await db
      .select()
      .from(admin)
      .where(sql`${admin.adminAddress} = ${adminAddress}`)
      .where(sql`${admin.isActive} = true`);

    const cohortAddresses = adminCohorts.map((a) => a.cohortAddress);

    if (cohortAddresses.length === 0) {
      return c.json({ requests: [] });
    }

    const pendingRequests = await db
      .select()
      .from(withdrawRequest)
      .where(sql`${withdrawRequest.status} = 'pending'`)
      .where(
        sql`${withdrawRequest.cohortAddress} IN (${sql.join(
          cohortAddresses,
          sql`, `
        )})`
      )
      .orderBy(sql`${withdrawRequest.requestTime} DESC`);

    return c.json({ requests: serializeBigInt(pendingRequests) });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return c.json({ error: "Failed to fetch pending requests" }, 500);
  }
});

app.get("/graphql-info", async (c) => {
  return c.json({
    message: "GraphQL endpoint available at /graphql",
    playground: "http://localhost:42069/graphql",
  });
});

export default app;
