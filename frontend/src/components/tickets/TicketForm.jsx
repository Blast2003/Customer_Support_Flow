import { useState } from "react";
import { createTicketApi } from "../../api/ticketApi";

export default function TicketForm({ onCreated }) {
  const [form, setForm] = useState({ subject: "", description: "", customerId: "" });

  const submit = async (e) => {
    e.preventDefault();
    const res = await createTicketApi({
      ...form,
      customerId: Number(form.customerId)
    });
    onCreated?.(res.data.data);
    setForm({ subject: "", description: "", customerId: "" });
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-white p-4">
      <input className="w-full rounded-lg border p-2" placeholder="Subject" value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      <textarea className="w-full rounded-lg border p-2" placeholder="Description" value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input className="w-full rounded-lg border p-2" placeholder="Customer ID" value={form.customerId}
        onChange={(e) => setForm({ ...form, customerId: e.target.value })} />
      <button className="rounded-lg bg-slate-900 px-4 py-2 text-white">Create Ticket</button>
    </form>
  );
}
