import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ShellLayout() {
  const { user, logout } = useAuth()
  const role = user?.role || 'colaborador'

  return (
    <div className="container-fluid mt-4">
      <div className="row g-3 shell-row">
        <div className="col-md-3">
          <aside className={`card app-sidebar role-${role}`}>
            <div className="sidebar-brand">
              <span className="sidebar-logo">LU</span>
              <span>Agendamento de Salas - Universidade</span>
            </div>

            <div className="card-body p-0">
              <p className="sidebar-user px-3 py-2 mb-0">{user?.nome}</p>

              <nav className="list-group list-group-flush">
                <NavLink to="/perfil" className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? 'is-active' : ''}`}>
                  <i className="bi bi-person icon" />
                  <span>Perfil</span>
                </NavLink>

                {user?.role === 'colaborador' && (
                  <NavLink
                    to="/colaborador/dashboard"
                    className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? 'is-active' : ''}`}
                  >
                    <i className="bi bi-calendar-check icon" />
                    <span>Reservas</span>
                  </NavLink>
                )}

                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? 'is-active' : ''}`}
                  >
                    <i className="bi bi-speedometer2 icon" />
                    <span>Dashboard Admin</span>
                  </NavLink>
                )}

                {user?.role === 'diretor' && (
                  <NavLink
                    to="/diretor/dashboard"
                    className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? 'is-active' : ''}`}
                  >
                    <i className="bi bi-speedometer2 icon" />
                    <span>Dashboard Diretor</span>
                  </NavLink>
                )}

                {user?.role === 'diretor' && (
                  <NavLink
                    to="/diretor/locais"
                    className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? 'is-active' : ''}`}
                  >
                    <i className="bi bi-geo-alt icon" />
                    <span>Locais</span>
                  </NavLink>
                )}
              </nav>

              <div className="p-3 pt-2">
                <button type="button" className="btn btn-outline-danger w-100" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-2" />
                  Sair
                </button>
              </div>
            </div>
          </aside>
        </div>

        <main className="col-md-9 content-area">
          <div className="content-card">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default ShellLayout
