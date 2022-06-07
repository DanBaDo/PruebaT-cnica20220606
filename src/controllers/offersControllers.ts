import express from "express"
import moment from "moment";

// TODO: import MailTypes
import { EmailStatus, Lang } from "../defines";
import { dbCurrentTripRequest, availableHotels } from "../db/queries/dbQueriesHotel";
import { getLastAcceptedMail, mailSchedulerFactory } from "./auxiliars";

export async function resendOfferCustomer(req: express.Request, res: express.Response) {

    let offset = 0;

    // Adds optional lang parameter to the request path
    const lang: Lang = Lang[req.params.lang] || 'CAS';

    // TODO: Properly hinting type
    const hotelRequests: any[] = await dbCurrentTripRequest();

    for (let index = 0; index < hotelRequests.length; index++) {

        // TODO: Properly hinting type
        const emailHR: any[] | undefined = await availableHotels(hotelRequests[index])

        // This code looks like doing nothing but cause a error.
        // If we send a response here, code still running.
        // When execution leaves for loop, it try to send
        // another response, raising an error.
        /*if (!emailHR) { // No availableHotels, stop proccesing.
            res.send({ ok: true });
        }*/
        
        const hoursFromRequest: number = moment().diff(
            moment(hotelRequests[index].triprequest.requestDate),
            "hours"
        );

        // TODO: Properly hinting type
        const mailMessages: any[] = await emailHR.getMail_messages();

        const lastAcceptedMail = getLastAcceptedMail(mailMessages)


        if (lastAcceptedMail) {
            const hoursFormLastAcceptedMail: number = moment().diff(
                moment(lastAcceptedMail.sendingDate),
                "hours"
            );
            if ( emailHR.lastStatus() === EmailStatus.ANSWERED ) {

                const mailScheduler = mailSchedulerFactory (emailHR, lang);

                // IDEA: solo tomar en cuenta la diferencia horaria entre el envio del mail y ahora
                if (
                    hoursFromRequest >= 24 &&
                    hoursFromRequest < 48 &&
                    hoursFormLastAcceptedMail >= 24 &&
                    hoursFormLastAcceptedMail < 48
                ) {
                    mailScheduler(offset+=1000)
                }
                if (
                    hoursFromRequest >= 48 &&
                    hoursFormLastAcceptedMail >= 48
                ) {
                    mailScheduler(offset+=1000)
                }
            }
        }
    }

    /**
     * We are respondig 200 { ok: true } anyway. 
     * If it's not important proccess completion, we can send response
     * firt thing in controller for sorting request time response.
     * If proccess completion is important, we need to add some kind of
     * exception control and give a proper significant response.
     */
    res.send({ ok: true });
}