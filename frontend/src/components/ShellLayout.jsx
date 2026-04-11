import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ShellLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>Locacao Universitaria</h1>
        <p>{user?.nome}</p>
        <nav>
          <Link to="/perfil">Perfil</Link>
          {user?.role === 'colaborador' && <Link to="/colaborador/dashboard">Reservas</Link>}
          {user?.role === 'admin' && <Link to="/admin/dashboard">Dashboard Admin</Link>}
          {user?.role === 'diretor' && <Link to="/diretor/dashboard">Dashboard Diretor</Link>}
          {user?.role === 'diretor' && <Link to="/diretor/locais">Locais</Link>}
        </nav>
        <button type="button" onClick={logout}>
          Sair
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default ShellLayout
