import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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

export default function Index({ proveedores }: Props) {
    const { flash } = usePage().props as any;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        id: null as number | null,
        nombre: '',
        numero_documento: '',
        telefono: '',
        correo_electronico: '',
        activo: true,
    });

    const [editando, setEditando] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando && data.id) {
            put(route('proveedores.update', data.id), {
                onSuccess: () => {
                    reset();
                    setEditando(false);
                },
            });
        } else {
            post(route('proveedores.store'), {
                onSuccess: () => reset(),
            });
        }
    };

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
    };

    return (

        <AppLayout>
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Proveedores</h1>

            {flash?.message && (
                <div className="p-4 bg-green-100 text-green-800 rounded-lg">{flash.message}</div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 bg-white border rounded-lg shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">
                    {editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre / Razón Social</label>
                        <input
                            type="text"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            required
                        />
                        {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">RIF / Cédula / NID</label>
                        <input
                            type="text"
                            value={data.numero_documento}
                            onChange={(e) => setData('numero_documento', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input
                            type="text"
                            value={data.telefono}
                            onChange={(e) => setData('telefono', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <input
                            type="email"
                            value={data.correo_electronico}
                            onChange={(e) => setData('correo_electronico', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    {editando && (
                        <button
                            type="button"
                            onClick={() => { reset(); setEditando(false); }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        {editando ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </form>

            {/* Listado */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-600">
                        <tr>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Documento</th>
                            <th className="p-3">Teléfono</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proveedores.map((p) => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-semibold">{p.nombre}</td>
                                <td className="p-3">{p.numero_documento || '-'}</td>
                                <td className="p-3">{p.telefono || '-'}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${p.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {p.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleEditar(p)}
                                        className="text-indigo-600 hover:underline text-xs font-semibold"
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </AppLayout>
    );
}