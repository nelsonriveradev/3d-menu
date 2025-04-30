import { MongoClient, ServerApiVersion } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    console.log("Creating new MongoDB client connection (development)");
    client = new MongoClient(MONGO_URI, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log("Creating new MongoDB client connection (production)");
  client = new MongoClient(MONGO_URI, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

/**
 * Example Usage in an API route or Server Action:
 *
 * import clientPromise from '@/lib/mongodb/dbConnect'; // Adjust path as needed
 *
 * export async function GET(request: Request) {
 *   try {
 *     const client = await clientPromise;
 *     const db = client.db("yourDatabaseName"); // Replace with your DB name
 *
 *     const items = await db
 *       .collection("yourCollectionName") // Replace with your collection name
 *       .find({})
 *       .limit(10)
 *       .toArray();
 *
 *     return new Response(JSON.stringify(items), {
 *       status: 200,
 *       headers: { 'Content-Type': 'application/json' },
 *     });
 *   } catch (e) {
 *     console.error(e);
 *     return new Response(JSON.stringify({ message: 'Failed to fetch data' }), { status: 500 });
 *   }
 * }
 */
