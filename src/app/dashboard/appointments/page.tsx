export default function AppointmentsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
        <p className="mt-2 text-slate-500">Manage patient appointments.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Appointment Management
        </h2>
        <p className="mt-2 text-slate-500">
          No appointments to display yet.
        </p>
      </div>
    </div>
  );
}
