// TODO: import MailTypes
import moment from "moment";
import { EmailStatus, Lang, MIN_MAIL_OFFSET } from "../defines";
import * as mailer from "../util/mailer";

/**
 * Returns last accepted email from array
 * @param mailMessages 
 * @returns 
 */
// TODO: Properly hinting type
export function getLastAcceptedMail(mailMessages: any[]): any {
    return mailMessages
            .filter(
                mail => 
                    (mail.status === EmailStatus.DELIVERED || mail.status === EmailStatus.OPENED) &&
                    mail.type === MailTypes.offerToCustomer)
            .sort(
                (firstMail, secondMail) =>
                    parseInt(moment(secondMail.sendingDate).format("X"), 10) -
                    parseInt(moment(firstMail.sendingDate).format("X"), 10)
            )[0];
}

/**
 * Provides a function for sending delayed mails
 * @param emailHR 
 * @param {Lang} lang
 * @returns (offset: number) => void
 */
// TODO: Properly hinting type
export function mailSchedulerFactory (emailHR: any, lang: Lang) {
    return  function (offset: number) {
        setTimeout(() => {
            async () => mailer.sendReceivedOfferCustomer(emailHR, lang);
            emailHR.addOneToOfferToCustomerEmailCount();
        }, MIN_MAIL_OFFSET + offset);
    }
}


