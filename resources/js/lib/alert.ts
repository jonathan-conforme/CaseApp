import Swal from 'sweetalert2';

// Instancia base personalizada con los colores de tu tema
const CustomSwal = Swal.mixin({
    background: '#11212D',
    color: '#CCD0CF',
    confirmButtonColor: '#253745',
    cancelButtonColor: '#06141B',
    customClass: {
        popup: 'border border-[#253745] rounded-2xl shadow-2xl',
        title: 'text-[#CCD0CF] font-bold text-lg',
        htmlContainer: 'text-[#9BA8AB] text-xs',
        confirmButton: 'px-4 py-2 bg-[#253745] hover:bg-[#4A5C6A] text-white text-xs font-bold rounded-xl border border-[#4A5C6A]/60 transition-all cursor-pointer shadow-md',
        cancelButton: 'px-4 py-2 bg-[#06141B] hover:bg-[#253745] text-[#9BA8AB] hover:text-white text-xs font-semibold rounded-xl border border-[#253745] transition-all cursor-pointer',
    },
    buttonsStyling: false,
});

export const alert = {
    // 1 línea para Notificación Éxito
    success: (title: string, text?: string) =>
        CustomSwal.fire({ icon: 'success', title, text, timer: 2500, showConfirmButton: false }),

    // 1 línea para Notificación Error
    error: (title: string, text?: string) =>
        CustomSwal.fire({ icon: 'error', title, text }),

    // 1 línea para Modal de Confirmación
    confirm: (title: string, text: string, onConfirm: () => void) => {
        CustomSwal.fire({
            icon: 'question',
            title,
            text,
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) onConfirm();
        });
    },
};
