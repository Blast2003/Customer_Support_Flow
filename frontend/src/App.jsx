import AppRoutes from "./routes/AppRoutes.jsx";
import SocketListeners from "./socket/SocketListeners.jsx";

export default function App() {
  return (
    <>
      <SocketListeners />
      <AppRoutes />
    </>
  );
}