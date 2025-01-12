import Swal from 'sweetalert2';
import { GetInsurancePackages } from '../../../store/insurancePackageSlice';

const confirmDeleteInsurance = (dispatch: any) =>
    Swal.fire({
        title: 'Are You Sure You Want To Delete This Package?',
        text: "\
  You won't be able to revert this!\
  You can deactivate it instead.\
   Do you still want to delete this Package?",
        icon: 'warning',
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
            dispatch(GetInsurancePackages() as any);
            return true;
        } else if (result.isDenied) {
            return false;
        }
    });

export default confirmDeleteInsurance;
