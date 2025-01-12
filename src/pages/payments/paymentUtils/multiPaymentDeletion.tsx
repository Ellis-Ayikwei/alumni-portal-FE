import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import confirmDialog from '../../../helper/confirmDialog';
import { GetPaymentsData } from '../../../store/paymentsSlice';
import showMessage from '../../../helper/showMessage';

const handleMultiPaymentDeletion = async (selectedPayments: { id: string }[], dispatch: Dispatch<AnyAction>, setSelectedrecords: any): Promise<boolean> => {
    const isConfirmed = await confirmDialog({
        title: 'Delete payments',
        body: ' This cannot be undone',
        note: 'It is recommended to deactivate the payment instead.',
        finalQuestion: 'Are you sure you want to delete this payment(s)?',
    });
    if (!isConfirmed) {
        return false;
    }

    const promises = selectedPayments.map((payment) => {
        return axiosInstance.delete(`/payments/${payment.id}`);
    });

    const results = await Promise.allSettled(promises);

    const failedDeletes = results.filter((result) => result.status === 'rejected');
    if (failedDeletes.length > 0) {
        console.error('Failed to delete payments:', failedDeletes);
    }

    if(results.every(result => result.status === 'fulfilled')) {
        showMessage("Payment(s) have been deleted successfully");
    }


    dispatch(GetPaymentsData() as any);
    setSelectedrecords([]);
    return true;
};

export default handleMultiPaymentDeletion;
