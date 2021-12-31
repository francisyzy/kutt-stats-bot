import * as dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: process.env.PORT || "3000",
  DATABASE_URL: process.env.DATABASE_URL,
  API_TOKEN: process.env.API_TOKEN,
  LOG_GROUP_ID: process.env.LOG_GROUP_ID,
  URL: process.env.URL,
  BOT_USERNAME: process.env.BOT_USERNAME || "a5953c8a_bot", //without the @
};

export default config;
