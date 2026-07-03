import DashboardLayout from "../../components/layout/DashboardLayout.jsx";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, Sneha. Here&apos;s your knowledge intelligence overview.
        </p>
      </div>

      {/* Reusable content container */}
      <section className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 shadow-xl shadow-blue-900/5 backdrop-blur-xl">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">
            Dashboard Content
          </p>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            This reusable area will render the Employee, Manager, HR, and Admin
            dashboards, along with Profile and Role Management views.
          </p>
        </div>
      </section>
    </DashboardLayout>
  )
}
