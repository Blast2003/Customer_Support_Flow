export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
