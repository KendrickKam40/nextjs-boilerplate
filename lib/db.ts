import { neon } from '@neondatabase/serverless';

type SqlClient = ReturnType<typeof neon>;
let client: SqlClient | undefined;

function getClient(): SqlClient {
  if (client) return client;
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Database is not configured');
  }
  client = neon(connectionString);
  return client;
}

// Resolve the connection only when a query runs. Importing a route must not
// require a database: public pages can use their built-in content without one.
// The proxy preserves Neon's tagged templates and transaction API.
export const sql = new Proxy((() => {}) as unknown as SqlClient, {
  apply(_target, thisArg, args) {
    return Reflect.apply(getClient(), thisArg, args);
  },
  get(_target, property) {
    const connection = getClient();
    const value = Reflect.get(connection, property);
    return typeof value === 'function' ? value.bind(connection) : value;
  },
});
