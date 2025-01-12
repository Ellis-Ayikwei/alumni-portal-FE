import Swal from 'sweetalert2';

interface ConfrimdialogParams {
    title: string;
    note?: string;
    body?: string;
    recommended?: string;
    finalQuestion: string;
    showSuccessMessage?: boolean;
}
/**
 * Displays a confirmation dialog using SweetAlert2.
 *
 * @param {Object} params - The parameters for the dialog.
 * @param {string} params.title - The title of the dialog.
 * @param {string} params.note - A note to display in the dialog.
 * @param {string} params.body - The main body text of the dialog.
 * @param {string} params.recommended - Recommended action text.
 * @param {string} params.finalQuestion - The final question in the dialog.
 * @param {boolean} [params.showSuccessMessage=false] - Whether to show a success message on confirmation.
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if denied.
 */
const ConfirmDialog = ({ title, note = '', body = '', recommended = '', finalQuestion, showSuccessMessage = false }: ConfrimdialogParams): Promise<boolean | undefined> => {
    return Swal.fire({
        title,
        icon: 'warning',
        html: `${body}<br>Note:<br>${note}<br>${recommended}<br><b>${finalQuestion}</b>`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        customClass: {
            actions: 'my-actions',
            cancelButton: 'order-1 right-gap',
            confirmButton: 'order-2',
            denyButton: 'order-3',
        },
    }).then((result) => {
        if (result.isConfirmed) {
            if (showSuccessMessage) {
                Swal.fire('Saved!', '', 'success');
            }
            return true;
        } else if (result.isDenied) {
            if (showSuccessMessage) {
                Swal.fire('Changes are not saved', '', 'info');
            }
            return false;
        }
    });
};

export default ConfirmDialog;
