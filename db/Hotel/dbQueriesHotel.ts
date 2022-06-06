import { db } from "../../db/database";

export async function dbCurrentTripRequest (callBack: Function) {
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
    }).then(callBack);
}
