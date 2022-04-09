import { currentTime } from "./utils/constants";
import db from "./db";

const { pool } = db();

export const customQuery = (text: string, value: any, allRows = false) => {
  return new Promise(function (resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) {
        return reject(err);
      }

      // client.on("notice", function(err) {
      //   return reject(err.message);
      // })

      client.query(text, value, (cErr, cRes) => {
        done();
        if (cErr) {
          return reject(cErr.stack);
        } else {
          resolve(allRows ? cRes.rows : cRes.rows[0]);
        }
      });
    });
  });
};

// NFT Owner

export const selectNFTOwner = (data: any) => {
  return new Promise(function (resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) {
        return reject(err);
      }
      const text = "SELECT * FROM dailydrop_nftowners WHERE id = $1";
      const value = [data.id];
      client.query(text, value, (cErr, cRes) => {
        done();
        if (cErr) {
          return reject(cErr.stack);
        } else {
          resolve(cRes.rows[0]);
        }
      });
    });
  });
};

export const addNFTOwner = (data: any) => {
  return new Promise(function (resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) {
        return reject(err);
      }
      const text =
        "INSERT INTO dailydrop_nftowners (wallet_address, owned, utility_token, nft_ids, access_token, refresh_token, access_token_ttl, refresh_token_ttl, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id";
      const value = [
        data.wallet_address,
        data.owned,
        data.utility_token,
        data.nft_ids,
        data.access_token,
        data.refresh_token,
        data.access_token_ttl,
        data.refresh_token_ttl,
        currentTime,
      ];
      client.query(text, value, (cErr, cRes) => {
        done();
        if (cErr) {
          return reject(cErr.stack);
        } else {
          resolve(cRes.rows[0]);
        }
      });
    });
  });
};

export const updateNFTOwnersUtilityToken = () => {
  return new Promise(function (resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) {
        return reject(err);
      }
      const text =
        "UPDATE dailydrop_nftowners SET utility_token = utility_token+1 WHERE owned = $1";
      const value = [true];
      client.query(text, value, (cErr, cRes) => {
        done();
        if (cErr) {
          return reject(cErr.stack);
        } else {
          resolve(cRes.rows[0]);
        }
      });
    });
  });
};