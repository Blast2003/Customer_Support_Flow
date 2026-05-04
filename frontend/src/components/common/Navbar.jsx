import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="font-semibold">Customer Support Flow</div>
      <button
        className="rounded-lg border px-4 py-2"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Logout
      </button>
    </header>
  );
}
