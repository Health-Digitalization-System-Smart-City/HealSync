const stats = [
  {
    title: "Total Patients",
    value: "120",
    delta: "+12% this month",
    deltaClass: "text-green-600",
  },
  {
    title: "Appointments",
    value: "48",
    delta: "8 today",
    deltaClass: "text-blue-600",
  },
  {
    title: "Positive Feedback",
    value: "80%",
    delta: "Good performance",
    deltaClass: "text-green-600",
  },
  {
    title: "Satisfaction",
    value: "92%",
    delta: "Excellent",
    deltaClass: "text-green-600",
  },
];

const branchPerformance = [
  { name: "Main Branch", percent: "95%" },
  { name: "East Branch", percent: "88%" },
  { name: "West Branch", percent: "82%" },
];

const monthlyOverview = [
  { month: "January", patients: "82 patients" },
  { month: "February", patients: "96 patients" },
  { month: "March", patients: "105 patients" },
  { month: "April", patients: "120 patients" },
];

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-2">
          View healthcare performance and statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-slate-500">{stat.title}</p>
            <h2 className="text-3xl font-bold mt-2">{stat.value}</h2>
            <p className={`text-sm ${stat.deltaClass} mt-2`}>{stat.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Branch Performance</h2>
          <div className="space-y-5">
            {branchPerformance.map((branch) => (
              <div key={branch.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{branch.name}</span>
                  <span className="text-sm text-slate-500">{branch.percent}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: branch.percent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Monthly Overview</h2>
          <div className="space-y-4">
            {monthlyOverview.map((entry, index) => (
              <div
                key={entry.month}
                className={`flex justify-between ${
                  index < monthlyOverview.length - 1 ? "border-b pb-4" : ""
                }`}
              >
                <span className="text-slate-600">{entry.month}</span>
                <span className="font-semibold">{entry.patients}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
