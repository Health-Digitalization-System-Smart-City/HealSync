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
        <p className="text-slate-600 mt-2">
          Manage healthcare services provided by the organization.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-slate-500">{stat.title}</p>
            <h2 className="text-3xl font-bold mt-2">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.name} className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{service.name}</h2>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                Active
              </span>
            </div>
            <p className="text-slate-500 mt-3">{service.description}</p>
            <div className="mt-5 text-sm text-slate-600">
              Patients served: <strong>{service.patients}</strong>
            </div>
            <button className="w-full mt-5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">
              View Service
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
