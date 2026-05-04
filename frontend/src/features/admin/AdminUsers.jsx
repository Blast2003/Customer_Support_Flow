import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getUsersApi, updateUserApi } from "../../api/userApi";
import LoadingState from "../../components/common/LoadingState";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ q: "", role: "" });

  // draft role edits only
  const [draftRoles, setDraftRoles] = useState({});

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getUsersApi({
        page,
        limit: pageInfo.limit,
        q: filters.q,
        role: filters.role,
      });

      const payload = res.data?.data ?? res.data;
      const rows = payload.rows || [];

      setUsers(rows);

      const nextDrafts = {};
      rows.forEach((user) => {
        nextDrafts[user.id] = user.role;
      });
      setDraftRoles(nextDrafts);

      setPageInfo({
        page: payload.page || page,
        limit: payload.limit || 10,
        totalPages: payload.totalPages || 1,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.role]);

  useEffect(() => {
    const t = setTimeout(() => loadUsers(1), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  const updateDraftRole = (userId, role) => {
    setDraftRoles((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const saveRole = async (userId) => {
    const role = draftRoles[userId];
    try {
      await updateUserApi(userId, { role });
      toast.success("User updated");
      await loadUsers(pageInfo.page);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update user");
    }
  };

  if (loading) return <LoadingState label="Loading users..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Users Management</h1>
        <p className="mt-2 text-slate-400">
          Review and manage all platform identities under one user table.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={filters.q}
          onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
          placeholder="Search by name or email"
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
        />
        <div className="relative">
          <select
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400"
          >
            <option value="" className="bg-slate-900 text-white">All roles</option>
            <option value="ADMIN" className="bg-slate-900 text-white">ADMIN</option>
            <option value="AGENT" className="bg-slate-900 text-white">AGENT</option>
            <option value="CUSTOMER" className="bg-slate-900 text-white">CUSTOMER</option>
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState title="No users found" description="Try a different filter." />
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/60">
          <div className="grid grid-cols-12 gap-3 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <div className="col-span-4">User</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-3">Action</div>
          </div>

          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-12 gap-3 border-b border-white/10 px-5 py-4 items-center transition hover:bg-white/5"
            >
              <div className="col-span-4">
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-sm text-slate-400">ID: {user.id}</p>
              </div>
              <div className="col-span-3 text-slate-300">{user.email}</div>
              <div className="col-span-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                  {user.role}
                </span>
              </div>
              <div className="col-span-3">
                <div className="relative w-full transition hover:-translate-y-0.5">
                  <select
                    value={draftRoles[user.id] || user.role}
                    onChange={(e) => updateDraftRole(user.id, e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-slate-800 px-3 py-2 pr-10 text-slate-100 outline-none transition focus:border-indigo-400"
                  >
                    <option value="ADMIN" className="bg-slate-800 text-white">ADMIN</option>
                    <option value="AGENT" className="bg-slate-800 text-white">AGENT</option>
                    <option value="CUSTOMER" className="bg-slate-800 text-white">CUSTOMER</option>
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>

                <button
                  onClick={() => saveRole(user.id)}
                  className="mt-2 w-full rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600 cursor-pointer"
                >
                  Confirm Role
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        onPageChange={(nextPage) => loadUsers(nextPage)}
      />
    </div>
  );
}