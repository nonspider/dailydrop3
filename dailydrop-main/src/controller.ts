import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { ethers } from "ethers";
import Web3 from "web3";

import {
  CLAIM_PRIVATE_KEY,
  currentTime,
  currentTimeSec,
  sevenDaysSec,
  yearSec,
} from "./utils/constants";
import { error } from "./middleware";
import { addNFTOwner, customQuery } from "./query";
import token from "./utils/token";
import { listNFTsOfOwnerV2 } from "./event";
import { balanceOf } from "./utils/contract";
import { spiritContract } from "./utils/provider";

// Query nft owner
export const nftOwner: RequestHandler = async (req, res, next) => {
  req.dataObj = req.nftOwner;
  req.httpStatus = 200;
  next();
};

// Signup or login
export const storeNFTOwner: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  const actualAddress = ethers.utils.verifyMessage(
    req.body.message,
    req.body.signature
  );

  if (
    !errors.isEmpty() ||
    req.body.wallet_address == ethers.constants.AddressZero ||
    actualAddress != req.body.wallet_address
  ) {
    const err = "Invalid input data";
    return error(res, "A4gdrsoUtG", err, 400, err);
  }

  const { accessToken, refreshToken, updateToken } = token({
    walletAddress: req.body.wallet_address,
  });

  let text = "SELECT * FROM dailydrop_nftowners WHERE wallet_address = $1";
  let value: any = [req.body.wallet_address];
  const selectedNFTOwner: any = await customQuery(text, value).catch((err) => {
    return error(
      res,
      "n33THJ0kH1",
      err,
      409,
      "An error occurred while quering nft owner"
    );
  });

  if (!selectedNFTOwner) {
    const nftIds = await listNFTsOfOwnerV2(req.body.wallet_address);
    let spiritBalance = await balanceOf(spiritContract, req.body.wallet_address);
    spiritBalance = parseInt(ethers.utils.formatEther(spiritBalance), 10);

    const data = {
      wallet_address: req.body.wallet_address,
      owned: !!nftIds.length,
      utility_token: spiritBalance,
      nft_ids: nftIds,
      access_token: accessToken,
      refresh_token: refreshToken,
      access_token_ttl: currentTimeSec + sevenDaysSec,
      refresh_token_ttl: currentTimeSec + yearSec,
    };

    const addedNFTOwner = await addNFTOwner(data).catch((err) => {
      return error(
        res,
        "zJ8onpsT7G",
        err,
        409,
        "An error occurred while adding nft owner"
      );
    });

    if (!addedNFTOwner) {
      const err = "An error occurred while adding nft owner";
      return error(res, "FZ7CcmbIwr", err, 409, err);
    }

    req.dataObj = data;
  } else {
    const updatedToken = await updateToken(req, res, selectedNFTOwner);

    const nftIds = selectedNFTOwner.nft_ids?.map((nftId: any) =>
      JSON.parse(nftId)
    );

    const data = {
      ...updatedToken,
      wallet_address: selectedNFTOwner.wallet_address,
      owned: selectedNFTOwner.owned,
      utility_token: selectedNFTOwner.utility_token,
      nft_ids: nftIds || [],
    };

    req.dataObj = data;
  }

  req.httpStatus = 200;

  next();
};

// Change utility token value
export const updateNFTOwnerUtility: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = "Invalid input data";
    return error(res, "ALe77YU956", err, 400, err);
  }

  let text =
    "UPDATE dailydrop_nftowners SET utility_token = $1, updated_at = $2 WHERE wallet_address = $3 RETURNING id";
  let value: any = [
    req.body.utility_token,
    currentTime,
    req.nftOwner.wallet_address,
  ];
  const updatedUtility = await customQuery(text, value).catch((err) => {
    return error(
      res,
      "D80dmjV99P",
      err,
      409,
      "An error occurred while updating utility token"
    );
  });

  if (!updatedUtility) {
    const err = "An error occurred while updating utility token";
    return error(res, "LKEdkbeXcW", err, 409, err);
  }

  req.dataObj = {
    detail: "Utility token updated",
  };
  req.httpStatus = 200;

  next();
}

// 30 minted nfts and their counts
export const storeMintedNFT: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = "Invalid input data";
    return error(res, "6EdUZmK6dd", err, 400, err);
  }

  let text = "SELECT * FROM dailydrop_mintednfts WHERE nft = $1";
  let value: any = [req.body.nft];
  const selectedMintedNFT: any = await customQuery(text, value).catch((err) => {
    return error(
      res,
      "gLK0gnpxA8",
      err,
      409,
      "An error occurred while quering minted nft"
    );
  });

  if (selectedMintedNFT) {
    if (selectedMintedNFT.count > 108) {
      const err = "Requested nft max supply reached";
      return error(res, "7400cvuaZl", err, 409, err);
    }

    text =
      "UPDATE dailydrop_mintednfts SET count = count+1, updated_at = $1 WHERE nft = $2 RETURNING id";
    value = [currentTime, req.body.nft];
    const updatedMintedNFT: any = await customQuery(text, value).catch(
      (err) => {
        return error(
          res,
          "Kbu8qbVmgE",
          err,
          409,
          "An error occurred while updating minted nft"
        );
      }
    );

    if (!updatedMintedNFT) {
      const err = "An error occurred while updating minted nft";
      return error(res, "KPu64008T9", err, 409, err);
    }
  } else {
    text =
      "INSERT INTO dailydrop_mintednfts (count, nft, created_at) VALUES ($1, $2, $3) RETURNING id";
    value = [1, req.body.nft, currentTime];
    const addedMintedNFT: any = await customQuery(text, value).catch((err) => {
      return error(
        res,
        "psXZO8rNcq",
        err,
        409,
        "An error occurred while adding minted nft"
      );
    });

    if (!addedMintedNFT) {
      const err = "An error occurred while adding minted nft";
      return error(res, "WDuvNkHTNH", err, 409, err);
    }
  }

  req.dataObj = {
    detail: "Minted NFT added",
  };
  req.httpStatus = 200;

  next();
};

// Query minted nfts
export const mintedNFT: RequestHandler = async (req, res, next) => {
  let text = "SELECT * FROM dailydrop_mintednfts";
  const selectedMintedNFT: any = await customQuery(text, null).catch((err) => {
    return error(
      res,
      "bKYY33S9jP",
      err,
      409,
      "An error occurred while quering minted nft"
    );
  });

  if (!selectedMintedNFT) {
    const err = "An error occurred while quering minted nfts";
    return error(res, "bCGZSaL3Aq", err, 409, err);
  }

  req.dataObj = selectedMintedNFT;
  req.httpStatus = 200;

  next();
};

// Update nft owner utility token, TODO: need to update the function name it's not Owned anymore
export const updateNFTOwnerOwned: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = "Invalid input data";
    return error(res, "Hv2u4oRYP1", err, 400, err);
  }

  let text =
    "UPDATE dailydrop_nftowners SET utility_token = utility_token+$1, updated_at = $2 WHERE wallet_address = $3 RETURNING id";
  let value: any = [
    req.body.utility_token,
    currentTime,
    req.body.wallet_address,
  ];
  const updatedNFTOwned = await customQuery(text, value).catch((err) => {
    return error(
      res,
      "D80dmjV99P",
      err,
      409,
      "An error occurred while transferring utility token"
    );
  });

  if (!updatedNFTOwned) {
    const err = "An error occurred while transferring utility token";
    return error(res, "LKEdkbeXcW", err, 409, err);
  }

  req.dataObj = {
    detail: "Utility token transferred",
  };
  req.httpStatus = 200;

  next();
};

export const sig: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = "Invalid input data";
    return error(res, "g8za5ReBhl", err, 400, err);
  }
  
  const totalAllocation = ethers.utils.parseEther(req.nftOwner.utility_token.toString()).toString();

  // maybe use toString("hex") instead of toString()
  const message = Web3?.utils
    ?.soliditySha3(
      { t: "address", v: req.body.wallet_address },
      { t: "uint256", v: totalAllocation }
    )
    ?.toString();

  const web3 = new Web3("");
  
  if (message) {
    const { signature } = web3.eth.accounts.sign(message, CLAIM_PRIVATE_KEY);

    req.dataObj = {
      signature,
      totalAllocation
    };
  }

  req.httpStatus = 200;

  next();
};
