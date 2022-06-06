import express

import { Lang } from "./defines"
import { dbCurrentTripRequest } from "./db/Hotel";

export async function resendOfferCustomer(req: any, res: express.Response) {
    const lang = Lang.Castellano;

    res.send({ ok: true });
}