import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import confirmDialog from '../../../helper/confirmDialog';
import { GetUsersData } from '../../../store/usersSlice';
import { GetAlumniData } from '../../../store/alumnigroupSlice';

const handleMultiGroupDelete = async (selectedGroups: { id: string }[], dispatch: Dispatch<AnyAction>, setSelectedrecords: any): Promise<boolean> => {
    const isConfirmed = await confirmDialog({
        title: 'Delete Groups',
        body: ' This cannot be undone',
        note: 'It is recommended to deactivate the group instead.',
        finalQuestion: 'Are you sure you want to delete this group?',
    });
    if (!isConfirmed) {
        return false;
    }

    const promises = selectedGroups.map((group) => {
        return axiosInstance.delete(`/alumni_groups/${group.id}`);
    });

    const results = await Promise.allSettled(promises);

    const failedDeletes = results.filter((result) => result.status === 'rejected');
    if (failedDeletes.length > 0) {
        console.error('Failed to delete users:', failedDeletes);
    }

    dispatch(GetAlumniData() as any);
    setSelectedrecords([]);
    return true;
};

export default handleMultiGroupDelete;
