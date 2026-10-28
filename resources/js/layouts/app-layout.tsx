import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { alert } from '@/lib/alert';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage().props as any;

    useEffect(() => {
        // 1. Maneja alertas estructradas ->with('alert', ['type' => 'success', 'title' => '...', 'text' => '...'])
        if (flash?.alert) {
            const { type, title, text } = flash.alert;
            if (type === 'success') alert.success(title, text);
            if (type === 'error') alert.error(title, text);
        }
        // 2. Maneja mensajes de éxito simples ->with('message', '...')
        else if (flash?.message) {
            alert.success('¡Operación Exitosa!', flash.message);
        }
        // 3. Maneja mensajes de error simples ->with('error', '...')
        else if (flash?.error) {
            alert.error('Error', flash.error);
        }
    }, [flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
};
