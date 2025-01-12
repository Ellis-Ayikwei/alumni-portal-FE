import Swal from 'sweetalert2';
import { GetUsersData } from '../../../store/usersSlice';

const showDeleteMesssage = (dispatch: any) =>
    Swal.fire({
        title: 'Are You Sure You Want To Delete This User(s)?',
        text: '\
  Note:\
  This action cannot be undone. \
 \
  It is adviced that users get deactivated instead.\
   Do you still want to delete this user?',
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
            dispatch(GetUsersData() as any);
            Swal.fire('Saved!', '', 'success');
            return true;
        } else if (result.isDenied) {
            Swal.fire('Changes are not saved', '', 'info');
            return false;
        }
    });

export default showDeleteMesssage;
