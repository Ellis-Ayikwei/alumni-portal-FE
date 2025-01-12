import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import { GetAlumniData } from '../../../store/alumnigroupSlice';

const handleMultiGroupActivation = async (selectedGroups: { id: string }[], dispatch: Dispatch<AnyAction>): Promise<boolean> => {
    const promises = selectedGroups.map((group) =>
        axiosInstance.put(`/alumni_groups/${group.id}`, {
            status: 'ACTIVATED',
        })
    );

    await Promise.all(promises);

    dispatch(GetAlumniData() as any);

    return true;
};

export default handleMultiGroupActivation;
