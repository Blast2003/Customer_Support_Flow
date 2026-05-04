import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  ShieldCheck,
  Sparkles,
  KeyRound,
  LogIn,
  Eye,
  EyeOff,
} from "lucide-react";

import { authApi } from "../../api/authApi.js";
import { useAuthStore } from "../../store/authStore.js";
import { loginSchema } from "../../utils/validators.js";
import { getHomeRouteByRole } from "../../utils/roleRoutes.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    const credential = credentialResponse?.credential;
    if (!credential) {
      toast.error("Google credential not found.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.googleLogin(credential);
      setAuth(result.data);
      toast.success("Welcome back!");
      navigate(getHomeRouteByRole(result.data.user.role));
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error(error.response?.data?.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await authApi.login(data.email, data.password);
      setAuth(result.data);
      toast.success("Welcome back!");
      navigate(getHomeRouteByRole(result.data.user.role));
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.16),_transparent_28%),linear-gradient(180deg,#0f172a_0%,#111827_100%)] px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              <Sparkles className="h-4 w-4 text-violet-300" />
              Customer Support Flow
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Support operations, ticket tracking, and realtime communication in
              one place.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Sign in to access your role-based dashboard, manage support
              requests, reply to customers, and keep service moving with a
              clean workflow.
            </p>

            <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Tickets
                </p>
                <p className="mt-2 text-lg font-bold text-white">
                  Fast handling
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Chat
                </p>
                <p className="mt-2 text-lg font-bold text-white">Realtime</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Access
                </p>
                <p className="mt-2 text-lg font-bold text-white">
                  Role-based
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-indigo-400/15 bg-indigo-500/15 p-3 text-indigo-300">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    Controlled account access
                  </p>
                  <p className="text-sm text-slate-400">
                    Users sign in with accounts provided by the support team.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
              <div className="text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  <LogIn className="h-4 w-4 text-violet-300" />
                  Secure login
                </div>

                <h2 className="mt-6 text-3xl font-extrabold text-white">
                  Sign in
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Use Google or your provided email account.
                </p>
              </div>

              {!showPasswordLogin ? (
                <div className="mt-8 space-y-5">
                  <div className="flex justify-center">
                    <div className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg shadow-black/10">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="outline"
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-slate-950 px-4 text-xs uppercase tracking-[0.2em] text-slate-500">
                        or use email
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPasswordLogin(true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Mail className="h-4 w-4" />
                    Use Email Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-indigo-500/15 p-2 text-indigo-300">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Email login
                        </p>
                        <p className="text-xs text-slate-400">
                          Best for internal testing and accounts issued by
                          support.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-10 py-3.5 text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/15"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-rose-300">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="Enter your password"
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-10 py-3.5 pr-12 text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1.5 text-sm text-rose-300">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {isLoading ? "Signing in..." : "Sign In"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPasswordLogin(false)}
                    className="w-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition-all duration-200 hover:bg-white/10"
                  >
                    Back to Google Login
                  </button>
                </form>
              )}

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Test Credentials
                </p>
                <div className="space-y-1 text-sm text-slate-300">
                  <p>Customer: customer1@gmail.test / Customer@12345</p>
                  <p>Agent: agent@crm.test / Agent@12345</p>
                  <p>Admin: admin@crm.test / Admin@12345</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}