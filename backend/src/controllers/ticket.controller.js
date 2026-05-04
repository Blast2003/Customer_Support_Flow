import * as ticketService from "../services/ticket.service.js";
import { responseFormatter } from "../utils/responseFormatter.js";
import {
  createTicketSchema,
  updateTicketSchema,
  addMessageSchema,
} from "../validations/ticket.validation.js";
import { getPagination } from "../utils/pagination.js";

export const createTicket = async (req, res, next) => {
  try {
    const body = createTicketSchema.parse(req.body);
    const ticket = await ticketService.createTicket(body, req.user);
    res.status(201).json(responseFormatter.success(ticket, "Ticket created"));
  } catch (err) {
    next(err);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const result = await ticketService.listTickets(req.query, req.user);
    const limit = Number(req.query.limit || 10);

    res.json(
      responseFormatter.success({
        rows: result.rows,
        count: result.count,
        page: Number(req.query.page || 1),
        limit,
        totalPages: Math.ceil(result.count / limit),
      })
    );
  } catch (err) {
    next(err);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicket(req.params.id, req.user);
    res.json(responseFormatter.success(ticket));
  } catch (err) {
    next(err);
  }
};

export const markTicketRead = async (req, res, next) => {
  try {
    await ticketService.markTicketRead(req.params.id, req.user);
    res.json(responseFormatter.success(true, "Ticket marked as read"));
  } catch (err) {
    next(err);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const body = updateTicketSchema.parse(req.body);
    const ticket = await ticketService.updateTicket(req.params.id, body, req.user);
    res.json(responseFormatter.success(ticket, "Ticket updated"));
  } catch (err) {
    next(err);
  }
};

export const addMessage = async (req, res, next) => {
  try {
    const body = addMessageSchema.parse(req.body);
    const msg = await ticketService.addMessage(
      {
        ticketId: Number(req.params.id),
        senderId: req.user.id,
        message: body.message,
        attachmentFile: body.attachmentFile || null,
      },
      req.user
    );

    res.status(201).json(responseFormatter.success(msg, "Message added"));
  } catch (err) {
    next(err);
  }
};

export const resolveTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.resolveTicket(req.params.id, req.user);
    res.json(responseFormatter.success(ticket, "Ticket resolved"));
  } catch (err) {
    next(err);
  }
};

export const escalateTicket = async (req, res, next) => {
  try {
    const result = await ticketService.escalateTicket(
      req.params.id,
      req.user,
      req.body.reason || ""
    );
    res.json(responseFormatter.success(result, "Ticket escalated"));
  } catch (err) {
    next(err);
  }
};