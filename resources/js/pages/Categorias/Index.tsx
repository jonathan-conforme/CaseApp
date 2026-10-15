import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    productos_count?: number;
}

interface Props {
    categorias: Categoria[];
}

export default function Index({ categorias }: Props) {
    const { flash } = usePage().props as any;
    const [editando, setEditando] = useState<Categoria | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id: null as number | null,
        nombre: '',
        descripcion: '',
        activo: true,
    });

    const handleEdit = (cat: Categoria) => {
        setEditando(cat);
        setData({
            id: cat.id,
            nombre: cat.nombre,
            descripcion: cat.descripcion || '',
            activo: cat.activo,
        });
    };

    const handleCancel = () => {
        setEditando(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando && data.id) {
            put(route('categorias.update', data.id), {
                onSuccess: () => handleCancel(),
            });
        } else {
            post(route('categorias.store'), {
                onSuccess: () => reset(),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Categorías', href: '/categorias' }]}>
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Categorías de Productos</h1>
                </div>

                {flash?.message && (
                    <div className="p-4 bg-green-100 text-green-800 border border-green-200 rounded-lg">
                        {flash.message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulario Crear / Editar */}
                    <div className="bg-white border rounded-lg p-6 shadow-sm h-fit">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                            {editando ? 'Editar Categoría' : 'Nueva Categoría'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    placeholder="Ej: Fundas Antigolpes"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    required
                                />
                                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                                <textarea
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    rows={3}
                                    placeholder="Detalles sobre la categoría..."
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                />
                                {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="activo"
                                    checked={data.activo}
                                    onChange={(e) => setData('activo', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="activo" className="text-sm font-medium text-gray-700">Categoría Activa</label>
                            </div>

                            <div className="flex space-x-2 pt-2">
                                {editando && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="w-1/2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`${editando ? 'w-1/2' : 'w-full'} px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50`}
                                >
                                    {processing ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar Categoría'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tabla de Listado */}
                    <div className="lg:col-span-2 bg-white border rounded-lg overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b text-gray-600">
                                <tr>
                                    <th className="p-3">Nombre</th>
                                    <th className="p-3">Descripción</th>
                                    <th className="p-3">Productos</th>
                                    <th className="p-3">Estado</th>
                                    <th className="p-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-500">
                                            No hay categorías registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    categorias.map((cat) => (
                                        <tr key={cat.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-semibold text-gray-800">{cat.nombre}</td>
                                            <td className="p-3 text-gray-500 max-w-xs truncate">{cat.descripcion || '-'}</td>
                                            <td className="p-3">
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                                    {cat.productos_count ?? 0}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${cat.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {cat.activo ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleEdit(cat)}
                                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold"
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}