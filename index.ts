import { db } from "../../db/database";
import * as mailer from "../util/mailer";
import * as moment from "moment";

import { Lang } from "./defines"

export async function resendOfferCustomer(req: any, res: express.Response) {
    const lang = Lang.Castellano;
    db.HotelRequest.findAll({
        where: { offerToCustomerEmailCount: { [Op.between]: [1, 2] } },
        attributes: ["id"],
        include: [
            {
                model: db.TripRequest,
                where: { cancelled: false },
                required: true,
            },
        ],
    }).then(async (hrs: Array<any>) => {
        let offset = 0;
        for (let index = 0; index < hrs.length; index++) {
            const hr = hrs[index];
            const emailHR = await db.HotelRequest.findByPk(hr.id, {
                include: [
                    {
                        model: db.HotelRequestStatus,
                        include: [
                            {
                                model: db.RequestStatus,
                                include: [
                                    {
                                        model: db.I18NRequestStatus,
                                        where: { lang },
                                        attributes: ["description"],
                                        required: false,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: db.Hotel,
                        include: [
                            { model: db.I18NHotel, attributes: ["name"], where: { lang } },
                        ],
                    },
                    { model: db.HotelOffer, include: [db.RoomOffer], required: false },
                    {
                        model: db.TripRequest,
                        include: [
                            {
                                model: db.User,
                                attributes: ["username", "name", "phone"],
                                include: [
                                    {
                                        model: db.SystemUser,
                                        as: "agent",
                                        attributes: ["name", "lastName", "phone", "email"],
                                    },
                                ],
                            },
                            {
                                model: db.Destination,
                                attributes: ["code"],
                                include: [
                                    {
                                        model: db.I18NDestination,
                                        attributes: ["name"],
                                        where: { lang },
                                        required: false,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
            if (!emailHR) {
                res.send({ ok: true });
            }
            const diffHoursBetweenRequestDateAndToday: number = moment().diff(
                moment(hr.triprequest.requestDate),
                "hours"
            );
            const mailMessages: Array<any> = await emailHR.getMail_messages();
            const lastAcceptedMail: any = mailMessages
                .filter((x: any) => {
                    return (
                        (x.status === "delivered" || x.status === "opened") &&
                        x.type === MailTypes.offerToCustomer
                    );
                })
                .sort(
                    (x: any, y: any) =>
                        parseInt(moment(y.sendingDate).format("X"), 10) -
                        parseInt(moment(x.sendingDate).format("X"), 10)
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
    });
    res.send({ ok: true });
}