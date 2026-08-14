const stats = [
  { title: "Total Services", value: "6" },
  { title: "Active Services", value: "6" },
  { title: "Patients Served", value: "120" },
];

const services = [
  {
    name: "General Consultation",
    description: "General healthcare consultation and medical assessment.",
    patients: "45",
  },
  {
    name: "Laboratory",
    description: "Medical laboratory testing and diagnostic services.",
    patients: "30",
  },
  {
    name: "Pharmacy",
    description: "Medicine dispensing and pharmacy support services.",
    patients: "25",
  },
  {
    name: "Emergency Care",
    description: "Emergency medical support and immediate care.",
    patients: "12",
  },
  {
    name: "Maternal Care",
    description: "Maternal health and pregnancy care services.",
    patients: "8",
  },
  {
    name: "Health Education",
    description: "Patient education and health awareness programs.",
    patients: "10",
  },
];

export default function ServicesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Services</h1>
        <p className="mt-2 text-slate-600">
          Manage healthcare services provided by the organization.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <p className="text-slate-500">{stat.title}</p>
            <h2 className="mt-2 text-3xl font-bold">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.name}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{service.name}</h2>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                Active
              </span>
            </div>
            <p className="mt-3 text-slate-500">{service.description}</p>
            <div className="mt-5 text-sm text-slate-600">
              Patients served: <strong>{service.patients}</strong>
            </div>
            <button className="mt-5 w-full rounded-lg bg-slate-100 px-4 py-2 hover:bg-slate-200">
              View Service
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
