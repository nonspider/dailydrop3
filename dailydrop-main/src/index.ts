import express, { Request, Response } from "express";
import cors from "cors";
import { body } from "express-validator";
import path from "path";
import cron from "node-cron";

import { BASE_APP_URL, BASE_WP_URL, PORT } from "./utils/constants";
import { authenticate, respond } from "./middleware";
import { mintedNFT, nftOwner, sig, storeMintedNFT, storeNFTOwner, updateNFTOwnerOwned, updateNFTOwnerUtility } from "./controller";
import { updateNFTOwnersUtilityToken } from "./query";
import event, { listNFTsOfOwnerV2 } from "./event";
import { NFTOwner } from "./utils/types";

const app = express();
app.use(
  cors({
    origin: [BASE_APP_URL, BASE_WP_URL],
  })
);
app.use(express.json());

declare global {
  namespace Express {
    interface Request {
      accessToken: string;
      refreshToken: string;
      accessTokenTTL: number;
      refreshTokenTTL: number;
      nftOwnerId: number;
      dataObj: any;
      httpStatus: number;
      nftOwner: NFTOwner;
    }
  }
}

cron.schedule("* * * * *", async () => {
  await updateNFTOwnersUtilityToken().catch((err) => {
    console.log("WieIRw4COP", err);
  });
  console.log("SYDEtDyzEC", "Daily drop dispatched");
});

// Not needed in ERC1155
// event();

app.get("/", async (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/api", async (req: Request, res: Response) => {
  res.status(400).json({ detail: "Bad Request" });
});

app.get(
  "/api/nftowner",
  authenticate,
  nftOwner,
  respond
);

app.post(
  "/api/nftowner",
  body("wallet_address").isLength({ min: 4 }).trim().escape(),
  body("message").isLength({ min: 4 }).trim().escape(),
  body("signature").isLength({ min: 4 }).trim().escape(),
  storeNFTOwner,
  respond
);

app.post(
  "/api/nftowner/claimed",
  body("utility_token").isInt().isLength({ min: 1 }).trim().escape(),
  authenticate,
  updateNFTOwnerUtility,
  respond
);

app.post(
  "/api/minted",
  body("nft").isInt({gt: 0, lt: 31}).isLength({ min: 1 }).trim().escape(),
  authenticate,
  storeMintedNFT,
  respond
);

app.get(
  "/api/minted",
  mintedNFT,
  respond
);

app.post(
  "/api/sig",
  body("wallet_address").isLength({ min: 4 }).trim().escape(),
  authenticate,
  sig,
  respond
);

app.post(
  "/api/nftowner/utility",
  body("wallet_address").isLength({ min: 4 }).trim().escape(),
  body("utility_token").isInt({ gt: 0 }).trim().escape(),
  updateNFTOwnerOwned,
  respond
);

app.listen(PORT, () => {
  console.log(`Daily Drop is listening at port ${PORT}`);
});
