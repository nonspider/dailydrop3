import { ethers } from "ethers";

import { customQuery } from "./query";
import { currentTime } from "./utils/constants";
import { balanceOf } from "./utils/contract";
import { nftContract } from "./utils/provider";

function addressEqual(a: any, b: any) {
  return a.toLowerCase() === b.toLowerCase();
}

export async function listNFTsOfOwnerV2(account: string) {
  const accounts = new Array(30).fill(account);
  const ids = [...Array(31).keys()].slice(1);
  const balances = await nftContract.balanceOfBatch(accounts, ids);
  return balances.map((balance: any) => parseInt(balance.toString(), 10));
}

export async function listNFTsOfOwner(account: string) {
  const sentLogs = await nftContract.queryFilter(
    nftContract.filters.Transfer(account, null)
  );
  const receivedLogs = await nftContract.queryFilter(
    nftContract.filters.Transfer(null, account)
  );

  const logs = sentLogs
    .concat(receivedLogs)
    .sort(
      (a, b) =>
        a.blockNumber - b.blockNumber || a.transactionIndex - b.transactionIndex
    );

  const nftIdsSet = new Set();

  for (const log of logs) {
    const { from, to, tokenId } = log.args as any;

    if (addressEqual(to, account)) {
      nftIdsSet.add(tokenId.toNumber());
    } else if (addressEqual(from, account)) {
      nftIdsSet.delete(tokenId.toNumber());
    }
  }

  return Array.from(nftIdsSet);
}

export default async function () {
  const transferEventOne =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" ||
    "Transfer";
  const transferEventTwo =
    "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925" ||
    "Transfer";

  // let events = await contract.queryFilter("*" as any)
  // console.log(events)

  async function transferEvent(from: any, to: any, value: { toNumber: () => any }, event: any) {
    console.log({
      from: from,
      to: to,
      value: value.toNumber(),
      data: event,
    });

    let text, val;
    if (from != ethers.constants.AddressZero) {
      const fromBalance = await balanceOf(nftContract, from);
      const fromNFTIds = await listNFTsOfOwner(from);

      text =
        "UPDATE dailydrop_nftowners SET owned = $1, nft_ids = $2, updated_at = $3 WHERE wallet_address = $4 RETURNING id";
      val = [!!fromBalance, fromNFTIds, currentTime, from];
      await customQuery(text, val).catch((err) =>
        console.log("4RHPjdIkQW", err)
      );
    }

    if (to != ethers.constants.AddressZero) {
      const toBalance = await balanceOf(nftContract, to);
      const toNFTIds = await listNFTsOfOwner(to);

      text =
        "UPDATE dailydrop_nftowners SET owned = $1, nft_ids = $2, updated_at = $3 WHERE wallet_address = $4 RETURNING id";
      val = [!!toBalance, toNFTIds, currentTime, to];
      await customQuery(text, val).catch((err) =>
        console.log("SjekGwLWPk", err)
      );
    }
  }

  nftContract.on(
    transferEventOne,
    async (from: any, to: any, value: { toNumber: () => any }, event: any) => {
      transferEvent(from, to, value, event);
    }
  );

  nftContract.on(
    transferEventTwo,
    async (from: any, to: any, value: { toNumber: () => any }, event: any) => {
      transferEvent(from, to, value, event);
    }
  );
}
