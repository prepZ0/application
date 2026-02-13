import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";

const prisma = new PrismaClient();

/**
 * Hash password in the same format Better Auth uses (scrypt).
 * Format: salt:hash (both hex-encoded)
 */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  // Match Better Auth's scrypt params: N=16384, r=16, p=1, dkLen=64
  const hash = scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  }).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Seeding database...\n");

  // 1. Create user
  const email = "nitishsah9845@gmail.com";
  const name = "nitish";
  const password = "password123";

  const existingUser = await prisma.user.findUnique({ where: { email } });

  let user;
  if (existingUser) {
    console.log(`User "${email}" already exists, skipping creation.`);
    user = existingUser;
  } else {
    user = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: true,
      },
    });

    // Create credential account (Better Auth stores passwords in Account table)
    await prisma.account.create({
      data: {
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: hashPassword(password),
      },
    });

    console.log(`Created user: ${name} <${email}>`);
  }

  // 2. Create organization (college)
  const orgSlug = "prepzero-college";
  const existingOrg = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });

  let org;
  if (existingOrg) {
    console.log(`Organization "${orgSlug}" already exists, skipping creation.`);
    org = existingOrg;
  } else {
    org = await prisma.organization.create({
      data: {
        name: "PrepZero College",
        slug: orgSlug,
        isActive: true,
        metadata: JSON.stringify({ createdBy: "seed" }),
      },
    });
    console.log(`Created organization: ${org.name}`);
  }

  // 3. Add user as member (student) of the organization
  const existingMember = await prisma.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
  });

  if (existingMember) {
    console.log(`User is already a member of "${org.name}", skipping.`);
  } else {
    await prisma.member.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: "member",
      },
    });
    console.log(`Added "${name}" as student (member) to "${org.name}"`);
  }

  console.log("\nSeed complete!");
  console.log(`  Login: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
