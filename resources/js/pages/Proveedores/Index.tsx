import React, { useState, useMemo } from 'react';
import { useForm, usePage, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import {
    Plus,
    Pencil,
    CheckCircle2,
    AlertCircle,
    X,
    Building2,
    Phone,
    Mail,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    ToggleLeft,
    ToggleRight,
    Contact2,
} from 'lucide-react';

interface Proveedor {
    id: number;
    nombre: string;
    numero_documento?: string;
    telefono?: string;
    correo_electronico?: string;
    activo: boolean;
}

interface Props {
    proveedores: Proveedor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Proveedores', href: '/proveedores' },
];

export default function Index({ proveedores = [] }: Props) {
    const { flash } = usePage().props as any;
    const [editando, setEditando] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Formulario gestionado por Inertia
    const { data, setData, post, put, processing, errors, reset } = useForm({
        id: null as number | null,
        nombre: '',
        numero_documento: '',
        telefono: '',
        correo_electronico: '',
        activo: true,
    });

    // Abrir Modal para Crear
    const openCreateModal = () => {
        setEditando(false);
        reset();
        setIsModalOpen(true);
    };

    // Abrir Modal para Editar
    const handleEditar = (p: Proveedor) => {
        setEditando(true);
        setData({
            id: p.id,
            nombre: p.nombre,
            numero_documento: p.numero_documento || '',
            telefono: p.telefono || '',
            correo_electronico: p.correo_electronico || '',
            activo: p.activo,
        });
        setIsModalOpen(true);
    };

    // Cerrar Modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditando(false);
        reset();
    };

    // Envío del Formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando && data.id) {
            put(route('proveedores.update', data.id), {
                onSuccess: () => handleCloseModal(),
            });
        } else {
            post(route('proveedores.store'), {
                onSuccess: () => handleCloseModal(),
            });
        }
    };

    // Definición de Columnas para TanStack Table
    const columnHelper = createColumnHelper<Proveedor>();

    const columns = useMemo(
        () => [
            columnHelper.accessor('nombre', {
                header: 'Proveedor / Razón Social',
                cell: (info) => (
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#253745] text-[#CCD0CF]">
                            <Building2 className="w-4 h-4 text-[#9BA8AB]" />
                        </div>
                        <span className="font-bold text-sm text-[#CCD0CF]">
                            {info.getValue()}
                        </span>
                    </div>
                ),
            }),
            columnHelper.accessor('numero_documento', {
                header: 'Documento / RIF / Cédula',
                cell: (info) => {
                    const doc = info.getValue();
                    return (
                        <div className="flex items-center gap-1.5 text-xs text-[#9BA8AB]">
                            <CreditCard className="w-3.5 h-3.5 text-[#4A5C6A] shrink-0" />
                            <span className="font-mono">{doc || '-'}</span>
                        </div>
                    );
                },
            }),
            columnHelper.accessor('telefono', {
                header: 'Teléfono',
                cell: (info) => {
                    const tel = info.getValue();
                    return (
                        <div className="flex items-center gap-1.5 text-xs text-[#9BA8AB]">
                            <Phone className="w-3.5 h-3.5 text-[#4A5C6A] shrink-0" />
                            <span>{tel || '-'}</span>
                        </div>
                    );
                },
            }),
            columnHelper.accessor('correo_electronico', {
                header: 'Correo Electrónico',
                cell: (info) => {
                    const mail = info.getValue();
                    return (
                        <div className="flex items-center gap-1.5 text-xs text-[#9BA8AB]">
                            <Mail className="w-3.5 h-3.5 text-[#4A5C6A] shrink-0" />
                            <span>{mail || '-'}</span>
                        </div>
                    );
                },
            }),
            columnHelper.accessor('activo', {
                header: 'Estado',
                cell: (info) =>
                    info.getValue() ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#253745] text-[#CCD0CF] border border-[#4A5C6A]/50">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Activo
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#06141B]/60 text-[#a53636] border border-[#253745]">
                            Inactivo
                        </span>
                    ),
            }),
            columnHelper.display({
                id: 'acciones',
                header: () => <div className="text-right">Acciones</div>,
                cell: (info) => (
                    <div className="text-right">
                        <button
                            type="button"
                            onClick={() => handleEditar(info.row.original)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#253745] hover:bg-[#4A5C6A] text-[#CCD0CF] hover:text-white border border-[#4A5C6A]/40 transition-all cursor-pointer active:scale-95"
                        >
                            <Pencil className="w-3.5 h-3.5 text-[#9BA8AB]" />
                            Editar
                        </button>
                    </div>
                ),
            }),
        ],
        []
    );

    // Instancia de TanStack Table
    const table = useReactTable({
        data: proveedores,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 8,
            },
        },
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Proveedores" />

            <div className="min-h-screen bg-[#06141B] text-[#CCD0CF] p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Encabezado Principal */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#253745]">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Contact2 className="w-6 h-6 text-[#9BA8AB]" />
                                <h1 className="text-2xl font-black tracking-tight text-[#CCD0CF]">
                                    Gestión de Proveedores
                                </h1>
                            </div>
                            <p className="text-xs text-[#9BA8AB]">
                                Registro, consulta y mantenimiento de la agenda comercial de proveedores.
                            </p>
                        </div>

                        {/* Botón Modal para Agregar */}
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#253745] hover:bg-[#4A5C6A] text-white font-bold text-xs tracking-wide border border-[#4A5C6A]/60 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
                        >
                            <Plus className="w-4 h-4 text-[#CCD0CF]" />
                            Nuevo Proveedor
                        </button>
                    </div>

                    {/* Alertas de Notificación */}
                    {flash?.message && (
                        <div className="flex items-center gap-3 p-3.5 bg-[#11212D] border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-medium shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{flash.message}</span>
                        </div>
                    )}

                    {/* Tabla de Proveedores con TanStack Table */}
                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-[#253745] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-sm text-[#CCD0CF]">Directorio Registrado</h2>
                                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#253745] text-[#9BA8AB]">
                                    {proveedores.length}
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#06141B] text-[#9BA8AB] border-b border-[#253745] font-semibold uppercase tracking-wider">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th key={header.id} className="p-4">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext()
                                                          )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-[#253745]/60">
                                    {table.getRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length} className="p-8 text-center text-[#9BA8AB]">
                                                No hay proveedores registrados en la base de datos.
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="transition-colors hover:bg-[#253745]/30"
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td key={cell.id} className="p-4">
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginador */}
                        {table.getPageCount() > 1 && (
                            <div className="p-4 border-t border-[#253745] flex items-center justify-between text-xs text-[#9BA8AB]">
                                <span>
                                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        className="p-1.5 rounded-lg border border-[#253745] bg-[#06141B] hover:bg-[#253745] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[#CCD0CF]"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="p-1.5 rounded-lg border border-[#253745] bg-[#06141B] hover:bg-[#253745] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[#CCD0CF]"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Modal para Crear y Editar Proveedor */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06141B]/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden space-y-6 p-6 relative">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-[#253745] pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-[#9BA8AB]" />
                                    {editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                                </h3>
                                <p className="text-xs text-[#9BA8AB] mt-0.5">
                                    {editando
                                        ? 'Actualiza los datos de contacto del proveedor.'
                                        : 'Registra una nueva empresa o entidad comercial.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="p-1.5 rounded-lg text-[#9BA8AB] hover:text-white hover:bg-[#253745] transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Formulario Modal */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                    Nombre / Razón Social *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Distribuidora Global C.A."
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                    required
                                />
                                {errors.nombre && (
                                    <p className="text-rose-400 text-xs mt-1 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.nombre}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                        RIF / Cédula / NID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="J-12345678-0"
                                        value={data.numero_documento}
                                        onChange={(e) => setData('numero_documento', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                        Teléfono
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="+58 412 0000000"
                                        value={data.telefono}
                                        onChange={(e) => setData('telefono', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    placeholder="contacto@proveedor.com"
                                    value={data.correo_electronico}
                                    onChange={(e) => setData('correo_electronico', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                />
                            </div>

                            {/* Toggle Estado Activo */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setData('activo', !data.activo)}
                                    className="flex items-center justify-between w-full p-3 rounded-xl bg-[#06141B] border border-[#253745] text-left cursor-pointer hover:border-[#4A5C6A]/60 transition-all"
                                >
                                    <div className="space-y-0.5">
                                        <span className="block text-xs font-bold text-[#CCD0CF]">
                                            Proveedor Activo
                                        </span>
                                        <span className="block text-[11px] text-[#9BA8AB]">
                                            Permite emitir órdenes de compra y asociar facturas
                                        </span>
                                    </div>
                                    {data.activo ? (
                                        <ToggleRight className="w-7 h-7 text-emerald-400 shrink-0" />
                                    ) : (
                                        <ToggleLeft className="w-7 h-7 text-[#4A5C6A] shrink-0" />
                                    )}
                                </button>
                            </div>

                            {/* Footer Acciones Modal */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#253745]">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-xl border border-[#253745] text-[#9BA8AB] hover:text-white hover:bg-[#253745] font-semibold text-xs transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.nombre}
                                    className="px-5 py-2 rounded-xl bg-[#253745] hover:bg-[#4A5C6A] text-white font-bold text-xs tracking-wide border border-[#4A5C6A]/60 shadow-md disabled:opacity-40 transition-all cursor-pointer"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : editando
                                        ? 'Actualizar Proveedor'
                                        : 'Guardar Proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
