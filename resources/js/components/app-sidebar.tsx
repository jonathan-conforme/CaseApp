import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Coins,
    Contact2,
    Tags,
    Package,
    ShoppingBag,
    ShoppingCart,
    FolderGit2,
    BookOpen,
    Layers,
    Sparkles,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Tasas de Cambio',
        url: '/tasas-cambio',
        icon: Coins,
    },
    {
        title: 'Proveedores',
        url: '/proveedores',
        icon: Contact2,
    },
    {
        title: 'Categorías',
        url: '/categorias',
        icon: Tags,
    },
    {
        title: 'Productos',
        url: '/productos',
        icon: Package,
    },
    {
        title: 'Compras',
        url: '/compras',
        icon: ShoppingBag,
    },
    {
        title: 'POS',
        url: '/pos',
        icon: ShoppingCart,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Planes',
        url: '/dashboard',
        icon: Layers,
    },
    {
        title: 'Suscribirse',
        url: '/dashboard',
        icon: Sparkles,
    },
    {
        title: 'Soporte',
        url: '/dashboard',
        icon: BookOpen,
    }
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-[#253745] bg-[#06141B]">
            <SidebarHeader className="border-b border-[#253745]/60 bg-[#06141B]">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-[#11212D]">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-[#06141B]">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-[#253745]/60 bg-[#06141B]">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
