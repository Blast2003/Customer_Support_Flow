import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_30%),linear-gradient(180deg,#0f172a_0%,#111827_100%)] px-4 text-slate-100">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/55 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-white">
            Unauthorized
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            You do not have permission to access this page.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}