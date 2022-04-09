import { RequestHandler, Response } from "express";

import { customQuery } from "./query";
import token from "./utils/token";

export const error = (
  res: Response,
  random: string,
  err: null | string = null,
  status: null | number = null,
  msg: null | string = null
) => {
  const message = "Authentication failed, please login again";
  console.log(random, err ?? message);
  return res.status(status ?? 401).json({ detail: msg ?? message });
};

// Verify access token
export const authenticate: RequestHandler = async (req, res, next) => {
  if (!req.headers.authorization) {
    const err = "Access token not found";
    return error(res, "PscTepcBCF", err, 400, err);
  }

  const authorization = req.headers.authorization.split(" ")[1];

  let text = "SELECT * FROM dailydrop_nftowners WHERE access_token = $1";
  let value: any = [authorization];
  const selectedNFTOwner: any = await customQuery(text, value).catch((err) => {
    return error(
      res,
      "ihpcmsSYrG",
      err,
      409,
      "An error occurred while quering nft owner"
    );
  });

  if (!selectedNFTOwner) {
    const err = "An error occurred while quering nft owner";
    return error(res, "gm0qPBsAKa", err, 409, err);
  }

  const { updateToken } = token({ walletAddress: req.body.wallet_address });

  const updatedToken = await updateToken(req, res, selectedNFTOwner);

  req.nftOwner = {
    ...updatedToken,
    wallet_address: selectedNFTOwner.wallet_address,
    owned: selectedNFTOwner.owned,
    utility_token: selectedNFTOwner.utility_token,
    nft_ids: selectedNFTOwner.nft_ids,
  };

  next();
};

export const respond: RequestHandler = async (req, res) => {
  res.status(req.httpStatus).json(req.dataObj);
};
