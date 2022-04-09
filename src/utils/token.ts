import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { error } from "../middleware";
import { customQuery } from "../query";

import {
  ACCESS_TOKEN_SECRET,
  currentTimeSec,
  REFRESH_TOKEN_SECRET,
  sevenDaysSec,
  yearSec,
} from "./constants";

export default function (data: any) {
  const accessToken = jwt.sign(data, ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
  const refreshToken = jwt.sign(data, REFRESH_TOKEN_SECRET, {
    expiresIn: "365d",
  });

  const updateToken = async (
    req: Request,
    res: Response,
    selectedNFTOwner: any
  ) => {
    if (currentTimeSec > selectedNFTOwner.access_token_ttl) {
      req.accessToken = accessToken;
      req.accessTokenTTL = currentTimeSec + sevenDaysSec;
    } else {
      req.accessToken = selectedNFTOwner.access_token;
      req.accessTokenTTL = selectedNFTOwner.access_token_ttl;
    }

    if (currentTimeSec > selectedNFTOwner.refresh_token_ttl) {
      req.refreshToken = refreshToken;
      req.refreshTokenTTL = currentTimeSec + yearSec;
    } else {
      req.refreshToken = selectedNFTOwner.refresh_token;
      req.refreshTokenTTL = selectedNFTOwner.refresh_token_ttl;
    }

    if (
      currentTimeSec > selectedNFTOwner.access_token_ttl ||
      currentTimeSec > selectedNFTOwner.refresh_token_ttl
    ) {
      let text =
        "UPDATE dailydrop_nftowners SET access_token = $1, refresh_token= $2, access_token_ttl = $3, refresh_token_ttl = $4 WHERE id = $5 RETURNING id";
      let value = [
        req.accessToken,
        req.refreshToken,
        req.accessTokenTTL,
        req.refreshTokenTTL,
        selectedNFTOwner.id,
      ];
      const updatedNFTOwner = await customQuery(text, value).catch((err) => {
        return error(
          res,
          "pwHG5MG4E6",
          err,
          409,
          "An error occurred while updating nft owner"
        );
      });

      if (!updatedNFTOwner) {
        const err = "An error occurred while updating nft owner";
        return error(res, "C4RSoLYeM3", err, 409, err);
      }
    }

    return {
      access_token: req.accessToken,
      refresh_token: req.refreshToken,
    };
  };

  return { accessToken, refreshToken, updateToken };
}
