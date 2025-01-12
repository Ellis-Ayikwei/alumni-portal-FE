import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import { GetPaymentsData } from '../../../store/paymentsSlice';
import showMessage from '../../../helper/showMessage';

const handleMultiPaymentFailure = async (selectedPayments: { id: string }[], dispatch: Dispatch<AnyAction>): Promise<boolean> => {
    const promises = selectedPayments.map((payment) =>
        axiosInstance.put(`/payments/${payment.id}`, {
            status: 'FAILED',
        })
    );

    const results = await Promise.allSettled(promises);

    dispatch(GetPaymentsData() as any);

    if(results.every(result => result.status === 'fulfilled')) {
        showMessage("Payments have been failed successfully");
    }

    return true;
};

export default handleMultiPaymentFailure;
