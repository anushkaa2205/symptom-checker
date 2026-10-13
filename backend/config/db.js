import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Some home routers / ISP DNS servers refuse the SRV lookup that mongodb+srv:// needs
// (shows up as "querySrv ECONNREFUSED"). Set DNS_SERVERS=8.8.8.8,1.1.1.1 in .env to use
// public DNS for these lookups instead. Leave it unset on Render.
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean));
}

const RETRY_DELAY_MS = 15000;

// Keeps retrying instead of exiting, so a database outage doesn't crash the whole
// site into a restart loop - pages still load and the app reconnects on its own.
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("DB Error: MONGO_URI is not set. Add it to backend/.env locally or to the Render environment.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const dbName = mongoose.connection.name;
    console.log(`MongoDB Connected (database: ${dbName})`);
    if (dbName === "test") {
      console.warn('MongoDB: no database name in MONGO_URI, so data is going into "test". Add /medora after the host, e.g. ...mongodb.net/medora?...');
    }
  } catch (err) {
    console.error(`DB Error: ${err.message}`);
    console.error(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
    setTimeout(connectDB, RETRY_DELAY_MS);
  }
};

export default connectDB;