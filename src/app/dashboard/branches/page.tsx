const stats = [
  { title: "Total Branches", value: "3" },
  { title: "Active Branches", value: "3" },
  { title: "Total Staff", value: "42" },
];

const branches = [
  { name: "Main Branch", location: "Addis Ababa", patients: "65", staff: "20", satisfaction: "95%" },
  { name: "East Branch", location: "Adama", patients: "32", staff: "12", satisfaction: "88%" },
  { name: "West Branch", location: "Jimma", patients: "23", staff: "10", satisfaction: "82%" },
];

export default function BranchesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Branches</h1>
        <p className="text-slate-600 mt-2">
          Manage healthcare branches and locations.
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
        {branches.map((branch) => (
          <div key={branch.name} className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{branch.name}</h2>
                <p className="text-slate-500 mt-1">{branch.location}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
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

            <button className="w-full mt-6 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
