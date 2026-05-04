import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createTicketApi } from "../../api/ticketApi";
import useFilePreview from "../../hooks/useFilePreview";

export default function NewTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM",
  });
  const [loading, setLoading] = useState(false);

  const {
    inputRef,
    fileName,
    fileBase64,
    previewUrl,
    handleFileChange,
    triggerFilePicker,
    clearFile,
  } = useFilePreview();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        attachmentFile: fileBase64 || undefined,
      };

      const res = await createTicketApi(payload);
      const ticket = res.data?.data ?? res.data;

      toast.success("Ticket created");
      navigate(`/customer/tickets/${ticket.id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Create New Ticket</h1>
        <p className="mt-2 text-slate-400">
          Describe the issue clearly. Add a screenshot if it helps the support team.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/20"
      >
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Subject"
          className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the issue"
          rows={6}
          className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
        />

        <div className="relative w-full">
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-indigo-400"
          >
            <option value="LOW" className="bg-slate-800 text-white">LOW</option>
            <option value="MEDIUM" className="bg-slate-800 text-white">MEDIUM</option>
            <option value="HIGH" className="bg-slate-800 text-white">HIGH</option>
            <option value="URGENT" className="bg-slate-800 text-white">URGENT</option>
          </select>

          {/* Custom Arrow Icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-800 px-4 py-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100">
                {fileName || "No file chosen"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Choose an image or PDF to attach to this ticket.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={triggerFilePicker}
                className="cursor-pointer rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600"
              >
                Choose File
              </button>

              {fileName ? (
                <button
                  type="button"
                  onClick={clearFile}
                  className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>

          {previewUrl ? (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Attachment preview"
                className="max-h-52 w-auto rounded-xl border border-white/10 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : null}
        </div>

        <button
          disabled={loading}
          className="cursor-pointer rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}