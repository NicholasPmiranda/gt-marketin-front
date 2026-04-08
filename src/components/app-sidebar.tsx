"use client"

import { type ComponentProps, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  FolderKanbanIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ListTodoIcon,
  SettingsIcon,
  VideoIcon,
} from "lucide-react"

type NavItem = {
  title: string
  url: string
  icon?: ReactNode
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/app",
      icon: <LayoutDashboardIcon />,
    },


    {
      title: "Credenciais",
      url: "/app/credenciais",
      icon: <KeyRoundIcon />,
    },
    {
      title: "Projetos",
      url: "/app/projetos",
      icon: <FolderKanbanIcon />,
    },
    {
      title: "Tarefas",
      url: "/app/tarefas",
      icon: <ListTodoIcon />,
    },
    {
      title: "Reunioes",
      url: "/app/reunioes",
      icon: <VideoIcon />,
    },
    {
      title: "Configuracoes",
      url: "/app/configuracoes",
      icon: <SettingsIcon />,
    },
  ] satisfies NavItem[],
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { user, logout } = useAuth()

  const isFuncionario = user?.perfil === "funcionario"
  const navMain = isFuncionario
    ? data.navMain.filter((item) => item.url !== "/app")
    : data.navMain
  const homeUrl = isFuncionario ? "/app/tarefas" : "/app"

  function handleLogout() {
    logout()
    router.push("/auth")
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
              <SidebarMenuButton
                className="data-[slot=sidebar-menu-button]:p-1.5!"
                render={<Link href={homeUrl} />}
              >
              <span className="text-base font-semibold">Gt Maketing</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "Usuario",
            email: user?.email ?? "",
            avatar: data.user.avatar,
          }}
          onLogout={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
