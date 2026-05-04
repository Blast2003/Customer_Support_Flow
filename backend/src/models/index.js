import User from "./User.js";
import Ticket from "./Ticket.js";
import TicketMessage from "./TicketMessage.js";
import Complaint from "./Complaint.js";
import SLARecord from "./SLARecord.js";
import Notification from "./Notification.js";
import EscalationRequest from "./EscalationRequest.js";

User.hasMany(Ticket, { foreignKey: "customerId", as: "createdTickets" });
User.hasMany(Ticket, { foreignKey: "agentId", as: "assignedTickets" });
User.hasMany(TicketMessage, { foreignKey: "senderId", as: "sentMessages" });
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });

User.hasMany(Complaint, { foreignKey: "createdBy", as: "createdComplaints" });
User.hasMany(Complaint, { foreignKey: "customerId", as: "customerComplaints" });

User.hasMany(EscalationRequest, { foreignKey: "createdBy", as: "createdEscalations" });
User.hasMany(EscalationRequest, { foreignKey: "handledBy", as: "handledEscalations" });
User.hasMany(EscalationRequest, { foreignKey: "targetUserId", as: "targetEscalations" });

Ticket.belongsTo(User, { foreignKey: "customerId", as: "customer" });
Ticket.belongsTo(User, { foreignKey: "agentId", as: "agent" });
Ticket.hasMany(TicketMessage, { foreignKey: "ticketId", as: "messages" });
Ticket.hasOne(SLARecord, { foreignKey: "ticketId", as: "slaRecord" });
Ticket.hasMany(Complaint, { foreignKey: "ticketId", as: "complaints" });
Ticket.hasMany(EscalationRequest, { foreignKey: "ticketId", as: "escalationRequests" });

TicketMessage.belongsTo(User, { foreignKey: "senderId", as: "sender" });
TicketMessage.belongsTo(Ticket, { foreignKey: "ticketId", as: "ticket" });

Complaint.belongsTo(Ticket, { foreignKey: "ticketId", as: "ticket" });
Complaint.belongsTo(User, { foreignKey: "customerId", as: "customer" });
Complaint.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

SLARecord.belongsTo(Ticket, { foreignKey: "ticketId", as: "ticket" });

EscalationRequest.belongsTo(Ticket, { foreignKey: "ticketId", as: "ticket" });
EscalationRequest.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
EscalationRequest.belongsTo(User, { foreignKey: "handledBy", as: "handler" });
EscalationRequest.belongsTo(User, { foreignKey: "targetUserId", as: "targetUser" });

Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

export {
  User,
  Ticket,
  TicketMessage,
  Complaint,
  SLARecord,
  Notification,
  EscalationRequest,
};