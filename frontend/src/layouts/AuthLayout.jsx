export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6">{children}</div>
    </div>
  );
}
