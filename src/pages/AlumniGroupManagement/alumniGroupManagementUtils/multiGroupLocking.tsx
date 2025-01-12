import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import { GetAlumniData } from '../../../store/alumnigroupSlice';

const handleMultiGroupLocking = async (selectedGroups: { id: string }[], dispatch: Dispatch<AnyAction>): Promise<boolean> => {
    const promises = selectedGroups.map((group) =>
        axiosInstance.put(`/alumni_groups/${group.id}`, {
            status: 'LOCKED',
        })
    );

    await Promise.all(promises);

    dispatch(GetAlumniData() as any);

    return true;
};

export default handleMultiGroupLocking;
