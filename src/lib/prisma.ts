/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getRequestContext } from "@cloudflare/next-on-pages";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  let d1: any;

  try {
    const ctx = getRequestContext() as any;
    d1 = ctx?.env?.collegepredictor_db || ctx?.env?.DB;
  } catch (err) {
    console.warn("Could not retrieve D1 context via getRequestContext:", err);
  }

  if (!d1) {
    d1 = (process.env as any).collegepredictor_db || (process.env as any).DB || (globalThis as any).collegepredictor_db || (globalThis as any).DB;
  }

  if (d1) {
    const adapter = new PrismaD1(d1);
    const client = new PrismaClient({ adapter });
    globalForPrisma.prisma = client;
    return client;
  } else {
    // Build-time dummy to prevent errors during Next.js static bundling/pre-rendering
    const dummyD1 = {
      prepare: () => ({
        bind: () => ({
          first: () => Promise.resolve(null),
          all: () => Promise.resolve({ results: [] }),
          run: () => Promise.resolve({ results: [] }),
        }),
      }),
      dump: () => Promise.resolve(new ArrayBuffer(0)),
      batch: () => Promise.resolve([]),
      exec: () => Promise.resolve({ count: 0, duration: 0 }),
    };
    const adapter = new PrismaD1(dummyD1 as any);
    const client = new PrismaClient({ adapter });
    globalForPrisma.prisma = client;
    return client;
  }
}

