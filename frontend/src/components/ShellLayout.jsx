import { NavLink, Outlet } from 'react-router-dom'
import { Avatar, Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import { useAuth } from '../context/useAuth'

function ShellLayout() {
  const { user, logout } = useAuth()
  const role = user?.role || 'colaborador'

  return (
    <div className="shell-root">
      <div className="shell-row">
        <aside className="shell-sidebar">
          <Card className={`app-sidebar role-${role}`}>
            <Flex align="center" gap="3" className="sidebar-brand">
              <Box className="sidebar-logo">LU</Box>
              <Text weight="bold">Agendamento de Salas - Universidade</Text>
            </Flex>

            <Flex align="center" gap="3" className="sidebar-user-wrap">
              <Avatar fallback={(user?.nome || 'U').slice(0, 2)} radius="full" />
              <Box>
                <Text as="p" size="2" color="gray">
                  Usuario conectado
                </Text>
                <Heading as="h3" size="3" className="sidebar-user">
                  {user?.nome}
                </Heading>
              </Box>
            </Flex>

            <nav className="sidebar-nav">
              <NavLink to="/perfil" className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}>
                Perfil
              </NavLink>

              {user?.role === 'colaborador' && (
                <NavLink to="/colaborador/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}>
                  Reservas
                </NavLink>
              )}

              {user?.role === 'admin' && (
                <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}>
                  Dashboard Admin
                </NavLink>
              )}

              {user?.role === 'diretor' && (
                <NavLink to="/diretor/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}>
                  Dashboard Diretor
                </NavLink>
              )}

              {user?.role === 'diretor' && (
                <NavLink to="/diretor/locais" className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}>
                  Locais
                </NavLink>
              )}
            </nav>

            <Button type="button" variant="soft" color="red" onClick={logout}>
              Sair
            </Button>
          </Card>
        </aside>

        <main className="content-area">
          <div className="content-card">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default ShellLayout
