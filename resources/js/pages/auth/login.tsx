import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#06141B] text-[#CCD0CF] grid grid-cols-1 lg:grid-cols-12 font-sans selection:bg-[#D4AF37] selection:text-black">
            <Head title="Iniciar Sesión - TITAN CASE" />

            {/* SECCIÓN IZQUIERDA: Oculta en móviles (`hidden`), visible en pantallas grandes (`lg:flex`) */}
            <div className="hidden lg:flex lg:col-span-6 bg-[#11212D] border-r border-[#253745] p-8 lg:p-12 flex-col justify-between relative overflow-hidden">

                {/* Iluminación sutil de fondo */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#253745]/40 rounded-full blur-3xl pointer-events-none" />

                {/* Etiqueta Superior */}
                <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#D4AF37] uppercase">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>POS & Inventory Control System</span>
                </div>

                {/* Contenido Central: Logo + Títulos */}
                <div className="my-auto py-10 flex flex-col items-center text-center space-y-6 relative z-10">

                    {/* Logotipo Escudo + Rayo TITAN CASE */}
                    <div className="relative w-28 h-28 flex items-center justify-center rounded-3xl bg-[#06141B] border border-[#D4AF37]/50 shadow-[0_0_35px_rgba(212,175,55,0.2)] p-4 group transition-transform duration-500 hover:scale-105">
                        <svg
                            viewBox="0 0 100 100"
                            className="w-20 h-20 text-[#D4AF37] drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)]"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M50 10 L85 24 C85 58 70 82 50 92 C30 82 15 58 15 24 L50 10 Z"
                                stroke="currentColor"
                                strokeWidth="5"
                                fill="none"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M55 20 L32 52 H52 L45 80 L70 46 H50 L55 20 Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>

                    {/* Títulos Principales */}
                    <div className="space-y-3 max-w-lg">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-[0.25em] text-[#D4AF37] uppercase font-mono drop-shadow-md">
                            TITAN CASE
                        </h1>
                        <p className="text-sm lg:text-base font-bold text-white tracking-wide">
                            Gestión de Inventario & Punto de Venta Inteligente
                        </p>
                        <p className="text-xs lg:text-sm text-[#9BA8AB] leading-relaxed pt-1">
                            Control total de existencias, cálculo de lotes FIFO, tasas de cambio multimoneda VES/USD y reportería en tiempo real.
                        </p>
                    </div>

                    {/* Ventajas clave */}
                    <div className="grid grid-cols-2 gap-3 pt-4 w-full max-w-md text-left">
                        <div className="p-3 rounded-xl bg-[#06141B]/80 border border-[#253745] flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-semibold text-[#CCD0CF]">Inventario FIFO</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#06141B]/80 border border-[#253745] flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-semibold text-[#CCD0CF]">POS Multimoneda</span>
                        </div>
                    </div>
                </div>

                {/* Footer de Marca */}
                <div className="text-[11px] text-[#4A5C6A] font-mono">
                    © {new Date().getFullYear()} TITAN CASE. Todos los derechos reservados.
                </div>
            </div>

            {/* SECCIÓN DERECHA: Formulario de Inicio de Sesión (Ocupa el 100% en móviles) */}
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-center p-6 sm:p-12 lg:p-16 bg-[#06141B] min-h-screen lg:min-h-0">
                <div className="max-w-md w-full mx-auto space-y-8">

                    {/* Header del Formulario */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            Iniciar Sesión
                        </h2>
                        <p className="text-xs text-[#9BA8AB]">
                            Ingresa tus credenciales autorizadas para acceder a la plataforma.
                        </p>
                    </div>

                    {/* Mensaje de Estado */}
                    {status && (
                        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium">
                            {status}
                        </div>
                    )}

                    {/* Formulario */}
                    <form className="space-y-5" onSubmit={submit}>

                        {/* Correo Electrónico */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                Correo Electrónico
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4A5C6A]">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="usuario@titancase.com"
                                    className="w-full pl-11 pr-3.5 py-3 rounded-xl bg-[#11212D] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-[#4A5C6A]"
                                />
                            </div>
                            <InputError message={errors.email} className="text-rose-400 text-xs mt-1" />
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                    Contraseña
                                </Label> {/* Contraseña
                                {canResetPassword && (
                                    <TextLink
                                        href={route('password.request')}
                                        className="text-xs text-[#D4AF37] hover:text-[#E5C158] transition-colors"
                                        tabIndex={5}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </TextLink>
                                )}*/}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4A5C6A]">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-3.5 py-3 rounded-xl bg-[#11212D] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-[#4A5C6A]"
                                />
                            </div>
                            <InputError message={errors.password} className="text-rose-400 text-xs mt-1" />
                        </div>

                        {/* Checkbox Recordar Sesión */}
                        <div className="flex items-center space-x-2 pt-1">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                                className="rounded border-[#253745] bg-[#11212D] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:text-black"
                            />
                            <Label htmlFor="remember" className="text-xs text-[#9BA8AB] font-medium cursor-pointer">
                                Recordar mi sesión en este dispositivo
                            </Label>
                        </div>

                        {/* Botón de Ingreso */}
                        <Button
                            type="submit"
                            tabIndex={4}
                            disabled={processing}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] hover:from-[#E5C158] hover:to-[#C59B1B] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/10 disabled:opacity-50 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 mt-4"
                        >
                            {processing ? (
                                <LoaderCircle className="h-4 w-4 animate-spin text-black" />
                            ) : (
                                <ShieldCheck className="h-4 w-4 text-black" />
                            )}
                            {processing ? 'Verificando...' : 'Acceder al Sistema'}
                        </Button>
                    </form>

                </div>
            </div>

        </div>
    );
}
