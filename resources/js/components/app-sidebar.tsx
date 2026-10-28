import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Coins,
    Contact2,
    Headphones,
    LayoutGrid,
    Package,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
    Tags,
} from 'lucide-react';
import AppLogo from './app-logo';

// 1. CATEGORÍA: PRINCIPAL
const generalNavItems: NavItem[] = [
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
];

// 2. CATEGORÍA: INVENTARIO & CATÁLOGO
const inventarioNavItems: NavItem[] = [
    {
        title: 'Productos',
        url: '/productos',
        icon: Package,
    },
    {
        title: 'Categorías',
        url: '/categorias',
        icon: Tags,
    },
    {
        title: 'Proveedores',
        url: '/proveedores',
        icon: Contact2,
    },
];

// 3. CATEGORÍA: VENTAS & OPERACIONES
// (el POS ahora vive como botón destacado arriba: "Nueva venta")
const operacionesNavItems: NavItem[] = [
    {
        title: 'Compras',
        url: '/compras',
        icon: ShoppingBag,
    },
    {
        title: 'Reportes de Ventas',
        url: '/ventas/historial',
        icon: BarChart3,
    },
];

// FOOTER (Planes y Suscribirse se unieron en la tarjeta "Mejora tu plan")
const footerNavItems: NavItem[] = [
    {
        title: 'Soporte',
        url: 'https://wa.me/593980659712?text=Hola,%20necesito%20soporte%20con%20el%20sistema',
        icon: Headphones,
        target: '_blank',
    },
];

const groupLabelClass = 'px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9BA8AB]';

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-[#253745] bg-[#06141B]">
            <SidebarHeader className="gap-4 border-b border-[#253745]/60 bg-[#06141B] p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-[#11212D]">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* ACCIÓN PRINCIPAL: POS */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Nueva venta (POS)"
                            className="h-11 justify-center gap-2.5 rounded-xl bg-[#5EC8D8] text-sm font-extrabold text-[#06141B] hover:bg-[#5EC8D8]/90 hover:text-[#06141B] active:bg-[#5EC8D8]/80 active:text-[#06141B] group-data-[collapsible=icon]:!size-11"
                        >
                            <Link href="/pos" prefetch>
                                <ShoppingCart className="!size-[18px]" strokeWidth={2.25} />
                                <span>Nueva venta (POS)</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="space-y-3 bg-[#06141B] py-3">
                {/* SECCIÓN 1 */}
                <SidebarGroup className="py-1">
                    <SidebarGroupLabel className={groupLabelClass}>Principal</SidebarGroupLabel>
                    <NavMain items={generalNavItems} />
                </SidebarGroup>

                {/* SECCIÓN 2 */}
                <SidebarGroup className="py-1">
                    <SidebarGroupLabel className={groupLabelClass}>Inventario & Catálogo</SidebarGroupLabel>
                    <NavMain items={inventarioNavItems} />
                </SidebarGroup>

                {/* SECCIÓN 3 */}
                <SidebarGroup className="py-1">
                    <SidebarGroupLabel className={groupLabelClass}>Ventas & Operaciones</SidebarGroupLabel>
                    <NavMain items={operacionesNavItems} />
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="gap-2 border-t border-[#253745]/60 bg-[#06141B] p-3">
                

                {/* Acceso a planes (sidebar colapsado) */}
                <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Mejora tu plan" className="text-[#5EC8D8] hover:bg-[#11212D] hover:text-[#5EC8D8]">
                            <Link href="/dashboard">
                                <Sparkles />
                                <span>Mejora tu plan</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
