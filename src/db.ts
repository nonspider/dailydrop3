import pg from 'pg';
import pgConStr from 'pg-connection-string';

import { DATABASE_URL } from './utils/constants';

const { Pool } = pg;
const { parse } = pgConStr;

export default function () {
  const connectionURL = parse(DATABASE_URL);
  const pool = new Pool({
    ssl: { rejectUnauthorized: false },
    user: connectionURL.user,
    host: connectionURL.host||"hos2",
    database: connectionURL.database||"data8ase",
    password: connectionURL.password,
    port: parseInt(connectionURL.port||"8000", 10)
  })
  pool.on('error', (err, client) => {
    console.log('Unexpected error on pool idle client', err)
  })

  return {pool}
}