import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import { GetAmendments } from '../../../store/amendmentsSlice';

const handleMultiAmendmnetDisable = async (selectedAmendments: { id: string }[], dispatch: Dispatch<AnyAction>): Promise<boolean> => {
    const promises = selectedAmendments.map( async (amendment) => {
        const prevStatus = await axiosInstance.get(`/amendments/${amendment?.id}`).then((response) => response.data.status);
            
        if (prevStatus !== 'PENDING') {
            return;
        }
        axiosInstance.put(`/amendments/${amendment.id}`, {
            status: 'REJECTED',
            user_id: '011b5707-cbc6-4528-9262-dd41aaf429bc',
        });
    });

    await Promise.all(promises);

    dispatch(GetAmendments() as any);

    return true;
};

export default handleMultiAmendmnetDisable;
