import dotenv from 'dotenv';
dotenv.config();

export const BASE_APP_URL = process.env.BASE_APP_URL || "https://example.com";
export const BASE_WP_URL = process.env.BASE_WP_URL || "http://zenspace-forall.com";

export const DATABASE_URL = process.env.DATABASE_URL || "postgres://";
export const PORT = process.env.PORT || 8000;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access2oken";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh2oken";

export const INFURA_ENDPOINT = process.env.INFURA_ENDPOINT || "https://infura.com/end9oint";
export const CHAIN_ID = process.env.CHAIN_ID || 1;
export const TOTAL_ALLOCATION = process.env.TOTAL_ALLOCATION || "4000000";
export const SPIRIT_CONTRACT_ADDRESS = process.env.SPIRIT_CONTRACT_ADDRESS || "0xToken";
export const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "0xNFT";
export const CLAIM_PRIVATE_KEY = process.env.CLAIM_PRIVATE_KEY || "0xPrivate";

export const currentTime = new Date().toISOString();
export const currentTimeSec = Math.floor(Date.now() / 1000);
export const delay = (1/12)*60*1000;
export const sevenDaysSec = 604800;
export const yearSec = 31556952;