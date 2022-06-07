import express from "express";
import moment from "moment";

import { Lang } from "../defines";
import * as mailer from "../util/mailer";
import { availableHotels, dbCurrentTripRequest } from "../db/queries/dbQueriesHotel";

export async function resendOfferCustomer(req: any, res: express.Response) {

    const lang = Lang[req.params.lang] || 'CAS';
    let offset = 0;

    // TODO: Properly hinting type
    const hotelRequests: any[] = await dbCurrentTripRequest();

    for (let index = 0; index < hotelRequests.length; index++) {

        // TODO: Properly hinting type
        const emailHR: any[] = await availableHotels(hotelRequests[index])

        if (!emailHR) {
            res.send({ ok: true });
        }
        
        const diffHoursBetweenRequestDateAndToday: number = moment().diff(
            moment(hotelRequests[index].triprequest.requestDate),
            "hours"
        );

        // TODO: Properly hinting type
        const mailMessages: any[] = await emailHR.getMail_messages();
        const lastAcceptedMail = mailMessages
            .filter(
                mail => 
                    (mail.status === "delivered" || mail.status === "opened") &&
                    mail.type === MailTypes.offerToCustomer)
            .sort(
                (firstMail, secondMail) =>
                    parseInt(moment(secondMail.sendingDate).format("X"), 10) -
                    parseInt(moment(firstMail.sendingDate).format("X"), 10)
            )[0];

        if (lastAcceptedMail) {
            const lastDeliveredMailDiffHours: number = moment().diff(
                moment(lastAcceptedMail.sendingDate),
                "hours"
            );
            if (emailHR.lastStatus() === "ANSWERED") {
                const sendMail: any = async function () {
                    mailer.sendReceivedOfferCustomer(emailHR, lang);
                };
                // IDEA: solo tomar en cuenta la diferencia horaria entre el envio del mail y ahora
                if (
                    diffHoursBetweenRequestDateAndToday >= 24 &&
                    diffHoursBetweenRequestDateAndToday < 48 &&
                    lastDeliveredMailDiffHours >= 24 &&
                    lastDeliveredMailDiffHours < 48
                ) {
                    offset += 1000;
                    setTimeout(() => {
                        sendMail();
                        emailHR.addOneToOfferToCustomerEmailCount();
                    }, 1000 + offset);
                }
                if (
                    diffHoursBetweenRequestDateAndToday >= 48 &&
                    lastDeliveredMailDiffHours >= 48
                ) {
                    offset += 1000;
                    setTimeout(() => {
                        sendMail();
                        emailHR.addOneToOfferToCustomerEmailCount();
                    }, 1000 + offset);
                }
            }
        }
    }
    res.send({ ok: true });
}