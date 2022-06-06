import express from "express"

import { Lang } from "./defines"
import { dbCurrentTripRequest } from "./db/Hotel/dbQueriesHotel";
import { resendOfferCustomerDBCallback } from "./db/Hotel/dbCallbacksHotel";

export async function resendOfferCustomer(req: any, res: express.Response) {
    const lang = Lang.Castellano;
    dbCurrentTripRequest(resendOfferCustomerDBCallback);
    res.send({ ok: true });
}