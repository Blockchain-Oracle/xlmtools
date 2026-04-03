import { Mppx } from "mppx/server";
import { stellar } from "@stellar/mpp/charge/server";
import { USDC_SAC_TESTNET } from "@stellar/mpp";

const RECIPIENT = process.env.STELLAR_RECIPIENT;
const MPP_SECRET_KEY = process.env.MPP_SECRET_KEY;

if (!RECIPIENT) throw new Error("STELLAR_RECIPIENT env var required");
if (!MPP_SECRET_KEY) throw new Error("MPP_SECRET_KEY env var required");

export const mppx = Mppx.create({
  secretKey: MPP_SECRET_KEY,
  methods: [
    stellar.charge({
      recipient: RECIPIENT,
      currency: USDC_SAC_TESTNET,
      network: "stellar:testnet",
    }),
  ],
});
