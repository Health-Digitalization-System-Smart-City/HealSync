const stats = [
  { title: "Total Branches", value: "3" },
  { title: "Active Branches", value: "3" },
  { title: "Total Staff", value: "42" },
];

const branches = [
  {
    name: "Main Branch",
    location: "Addis Ababa",
    patients: "65",
    staff: "20",
    satisfaction: "95%",
  },
  {
    name: "East Branch",
    location: "Adama",
    patients: "32",
    staff: "12",
    satisfaction: "88%",
  },
  {
    name: "West Branch",
    location: "Jimma",
    patients: "23",
    staff: "10",
    satisfaction: "82%",
  },
];

export default function BranchesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Branches</h1>
        <p className="mt-2 text-slate-600">
          Manage healthcare branches and locations.
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
        {branches.map((branch) => (
          <div
            key={branch.name}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{branch.name}</h2>
                <p className="mt-1 text-slate-500">{branch.location}</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                Active
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-sm text-slate-600">
                Patients: <strong>{branch.patients}</strong>
              </p>
              <p className="text-sm text-slate-600">
                Staff: <strong>{branch.staff}</strong>
              </p>
              <p className="text-sm text-slate-600">
                Satisfaction: <strong>{branch.satisfaction}</strong>
              </p>
            </div>

            <button className="mt-6 w-full rounded-lg bg-slate-100 px-4 py-2 hover:bg-slate-200">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
