import { ethers } from "ethers";

import { NFT_ABI, SPIRIT_ABI } from "./abi";
import { CHAIN_ID, INFURA_ENDPOINT, NFT_CONTRACT_ADDRESS, SPIRIT_CONTRACT_ADDRESS } from "./constants";

export const provider = new ethers.providers.WebSocketProvider(
  INFURA_ENDPOINT,
  +CHAIN_ID
);

export const nftContract = new ethers.Contract(
  NFT_CONTRACT_ADDRESS,
  NFT_ABI,
  provider
);

export const spiritContract = new ethers.Contract(
  SPIRIT_CONTRACT_ADDRESS,
  SPIRIT_ABI,
  provider
);