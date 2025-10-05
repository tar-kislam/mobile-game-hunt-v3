require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  try {
    console.log("Using DATABASE_URL=", process.env.DATABASE_URL);
    await prisma.;
    console.log("DB OK");
  } catch (e) {
    console.error("DB ERROR", e);
  } finally {
    await prisma.();
  }
})();
