require("dotenv").config();
const { Group, sequelize } = require("../models"); // Import Group and sequelize
const { exec } = require("child_process");

const migrateAndSeed = async () => {
  try {
    console.log("Running migrations...");
    await sequelize.sync();

    // Check if the groups table has any entries
    const groups = await Group.findAll();
    if (groups.length > 0) {
      console.log("Groups table is already populated. Skipping migration.");
      return; // Exit if groups already exist
    }

    // Run seed files
    console.log("Seeding database...");
    return new Promise((resolve, reject) => {
      exec("npx sequelize-cli db:seed:all", (err, stdout, stderr) => {
        if (err) {
          console.error(`Error seeding: ${stderr}`);
          return reject(err);
        }
        console.log(stdout);
        console.log("Database seeded successfully.");
        resolve();
      });
    });
  } catch (error) {
    console.error("Error during migration and seeding:", error);
    throw error;
  }
};

module.exports = migrateAndSeed;
