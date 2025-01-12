import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import showMessage from '../../../helper/showMessage';
import { GetAmendments } from '../../../store/amendmentsSlice';

const handleMultiAmendmentApproval = async (amendments: { id: string }[], dispatch: Dispatch<AnyAction>): Promise<boolean> => {
    const updatePromises = amendments.map(async ({ id }) => {
        const currentStatus = await axiosInstance.get(`/amendments/${id}`).then((response) => response.data.status);

        if (currentStatus !== 'PENDING') {
            return;
        }

        await axiosInstance.put(`/amendments/${id}`, {
            status: 'APPROVED',
            user_id: localStorage.getItem('userId'),
        });
    });

    await Promise.all(updatePromises);

    dispatch(GetAmendments() as any);
    showMessage('Amendment(s) Approved Successfully', 'success');

    return true;
};

export default handleMultiAmendmentApproval;
