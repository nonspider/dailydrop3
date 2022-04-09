import db from "./db";
const { pool } = db();

export default (function () {
  pool.connect((err, client, done) => {
    if (err) console.log("Unexpected error on connecting to model pool", err);

    const text = `CREATE TABLE dailydrop_nftowners (
        id SERIAL PRIMARY KEY,
        wallet_address TEXT NOT NULL,
        owned BOOLEAN NOT NULL,
        utility_token BIGINT NOT NULL,
        nft_ids INT[],
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        access_token_ttl BIGINT NOT NULL,
        refresh_token_ttl BIGINT NOT NULL,
        updated_at TIMESTAMP,
        created_at TIMESTAMP
      );
      
      CREATE TABLE dailydrop_mintednfts (
        id SERIAL PRIMARY KEY,
        nft INT NOT NULL,
        count INT NOT NULL,
        updated_at TIMESTAMP,
        created_at TIMESTAMP
      );`;

    client.query(text, (cErr, cRes) => {
      done();
      if (cErr) {
        console.log(cErr.stack);
      } else {
        console.log("Model created");
      }
    });
  });
})();