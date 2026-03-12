import { Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <nav className="flex gap-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-primary hover:bg-amber-50'
                }`
              }
            >
              📋 المعاملات
            </NavLink>
            <NavLink
              to="/members"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-primary hover:bg-amber-50'
                }`
              }
            >
              👥 الأعضاء
            </NavLink>
          </nav>

          <div className="text-right">
            <div className="text-primary font-bold text-xl" style={{ fontFamily: "'Traditional Arabic', Arial" }}>
              كنيسة السيدة العذراء مريم - مسرة
            </div>
            <div className="text-primary font-bold text-lg">لجنة البر</div>
          </div>
        </div>
        {/* Gold divider */}
        <div className="divider mx-0 my-0" />
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
