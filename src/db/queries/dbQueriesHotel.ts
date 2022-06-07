import { db } from "../database";
import { Lang } from "../../defines";

const lang = Lang.Castellano;

/**
 * Current hotel trip requests
 * @returns [] 
 */
export function dbCurrentTripRequest () {
    return db.HotelRequest.findAll({
        where: { offerToCustomerEmailCount: { [Op.between]: [1, 2] } },
        attributes: ["id"],
        include: [
            {
                model: db.TripRequest,
                where: { cancelled: false },
                required: true,
            },
        ],
    })
}

/**
 * I'm not sure. Posibly returns available hotels related to tryp requests
 * and lang.
 * @param hotelRequest 
 */
export function availableHotels (hotelRequest) {
    return db.HotelRequest.findByPk(hotelRequest.id, {
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
}