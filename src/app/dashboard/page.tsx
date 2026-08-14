import Link from "next/link";

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
    title: "Feedback",
    value: "35",
    delta: "5 new",
    deltaClass: "text-orange-600",
  },
  {
    title: "Satisfaction",
    value: "92%",
    delta: "Excellent",
    deltaClass: "text-green-600",
  },
];

const recentFeedback = [
  { title: "Excellent service", when: "Today" },
  { title: "Staff were very helpful", when: "Yesterday" },
  { title: "Waiting time was long", when: "2 days ago" },
];

const quickActions = [
  {
    name: "View Feedback",
    description: "Review patient feedback",
    href: "/dashboard/feedback",
  },
  {
    name: "View Analytics",
    description: "View healthcare statistics",
    href: "/dashboard/analytics",
  },
  {
    name: "Manage Branches",
    description: "Manage healthcare locations",
    href: "/dashboard/branches",
  },
  {
    name: "Manage Services",
    description: "Manage healthcare services",
    href: "/dashboard/services",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Welcome back! Here is an overview of your healthcare system.
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
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Feedback</h2>
          </div>
          <div className="divide-y">
            {recentFeedback.map((item) => (
              <div key={item.title} className="p-5">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-slate-500 mt-1">
                  Patient feedback · {item.when}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
              >
                <h3 className="font-semibold">{action.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
