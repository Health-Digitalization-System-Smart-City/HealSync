const stats = [
  { title: "Total Users", value: "42" },
  { title: "Active Users", value: "39" },
  { title: "Administrators", value: "3" },
];

const users = [
  { name: "Admin User", email: "admin@example.com", role: "Admin", roleClass: "bg-purple-100 text-purple-700" },
  { name: "Manager User", email: "manager@example.com", role: "Manager", roleClass: "bg-blue-100 text-blue-700" },
  { name: "Analyst User", email: "analyst@example.com", role: "Analyst", roleClass: "bg-yellow-100 text-yellow-700" },
  { name: "Staff User", email: "staff@example.com", role: "Analyst", roleClass: "bg-yellow-100 text-yellow-700" },
];

export default function UsersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-600 mt-2">
          Manage system users and their roles.
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

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">System Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email} className="border-t">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-slate-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${user.roleClass}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
