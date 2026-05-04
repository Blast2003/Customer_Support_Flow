import { TicketReadState } from "../models/index.js";

export const markTicketRead = async (ticketId, userId) => {
  const [row, created] = await TicketReadState.findOrCreate({
    where: { ticketId, userId },
    defaults: {
      ticketId,
      userId,
      lastSeenAt: new Date(),
    },
  });

  if (!created) {
    await row.update({ lastSeenAt: new Date() });
  }

  return row;
};