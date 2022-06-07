// TODO: import MailTypes
import moment from "moment";
import { Lang, MIN_MAIL_OFFSET } from "../defines";
import * as mailer from "../util/mailer";

// TODO: Properly hinting type
export function getLastAcceptedMail(mailMessages: any[]): any {
    return mailMessages
            .filter(
                mail => 
                    (mail.status === "delivered" || mail.status === "opened") &&
                    mail.type === MailTypes.offerToCustomer)
            .sort(
                (firstMail, secondMail) =>
                    parseInt(moment(secondMail.sendingDate).format("X"), 10) -
                    parseInt(moment(firstMail.sendingDate).format("X"), 10)
            )[0];
}

// TODO: Properly hinting type
export function mailSchedulerFactory (emailHR: any, lang: Lang) {
    return  function (offset: number) {
        setTimeout(() => {
            async () => mailer.sendReceivedOfferCustomer(emailHR, lang);
            emailHR.addOneToOfferToCustomerEmailCount();
        }, MIN_MAIL_OFFSET + offset);
    }
}


