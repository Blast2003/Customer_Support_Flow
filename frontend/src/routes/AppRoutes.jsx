import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { getHomeRouteByRole } from "../utils/roleRoutes.js";
import RoleProtectedRoute from "./RoleProtectedRoute.jsx";

import LoginPage from "../features/auth/LoginPage.jsx";
import UnauthorizedPage from "../features/auth/UnauthorizedPage.jsx";

import DashboardLayout from "../layouts/DashboardLayout.jsx";

import CustomerDashboard from "../features/customer/CustomerDashboard.jsx";
import CustomerTickets from "../features/customer/CustomerTickets.jsx";
import NewTicket from "../features/customer/NewTicket.jsx";
import CustomerComplaints from "../features/customer/CustomerComplaints.jsx";
import CustomerTicketDetail from "../features/customer/CustomerTicketDetail.jsx";

import AgentDashboard from "../features/agent/AgentDashboard.jsx";
import AgentTickets from "../features/agent/AgentTickets.jsx";
import TicketQueue from "../features/agent/TicketQueue.jsx";
import AgentComplaints from "../features/agent/AgentComplaints.jsx";
import AgentTicketDetail from "../features/agent/AgentTicketDetail.jsx";

import AdminDashboard from "../features/admin/AdminDashboard.jsx";
import AdminTickets from "../features/admin/AdminTickets.jsx";
import AdminUsers from "../features/admin/AdminUsers.jsx";
import AdminComplaints from "../features/admin/AdminComplaints.jsx";
import AdminReports from "../features/admin/AdminReports.jsx";
import AdminSLA from "../features/admin/AdminSLA.jsx";
import AdminTicketDetail from "../features/admin/AdminTicketDetail.jsx";

import NotificationsPage from "../features/notifications/NotificationsPage.jsx";
import EscalationRequestsPage from "../features/escalations/EscalationRequestsPage.jsx";

function RoleHomeRedirect() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token) return <Navigate to="/login" replace />;
  return <Navigate to={getHomeRouteByRole(user?.role)} replace />;
}

export default function AppRoutes() {
  const token = useAuthStore((state) => state.token);

  return (
    <Routes>
      <Route path="/" element={<RoleHomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/customer/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["CUSTOMER"]}>
            <DashboardLayout>
              <CustomerDashboard />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/customer/tickets"
        element={
          <RoleProtectedRoute allowedRoles={["CUSTOMER"]}>
            <DashboardLayout>
              <CustomerTickets />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/customer/new-ticket"
        element={
          <RoleProtectedRoute allowedRoles={["CUSTOMER"]}>
            <DashboardLayout>
              <NewTicket />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/customer/complaints"
        element={
          <RoleProtectedRoute allowedRoles={["CUSTOMER"]}>
            <DashboardLayout>
              <CustomerComplaints />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/customer/tickets/:id"
        element={
          <RoleProtectedRoute allowedRoles={["CUSTOMER"]}>
            <DashboardLayout>
              <CustomerTicketDetail />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/agent/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["AGENT"]}>
            <DashboardLayout>
              <AgentDashboard />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/agent/tickets"
        element={
          <RoleProtectedRoute allowedRoles={["AGENT"]}>
            <DashboardLayout>
              <AgentTickets />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/agent/queue"
        element={
          <RoleProtectedRoute allowedRoles={["AGENT"]}>
            <DashboardLayout>
              <TicketQueue />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/agent/complaints"
        element={
          <RoleProtectedRoute allowedRoles={["AGENT"]}>
            <DashboardLayout>
              <AgentComplaints />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/agent/tickets/:id"
        element={
          <RoleProtectedRoute allowedRoles={["AGENT"]}>
            <DashboardLayout>
              <AgentTicketDetail />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout>
              <AdminTickets />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout>
              <AdminUsers />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout>
              <AdminComplaints />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout>
              <AdminReports />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/sla"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout>
              <AdminSLA />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/tickets/:id"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout>
              <AdminTicketDetail />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "AGENT", "CUSTOMER"]}>
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/agent/escalations"
        element={
          <RoleProtectedRoute allowedRoles={["AGENT"]}>
            <DashboardLayout>
              <EscalationRequestsPage />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/escalations"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout>
              <EscalationRequestsPage />
            </DashboardLayout>
          </RoleProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes>
  );
}