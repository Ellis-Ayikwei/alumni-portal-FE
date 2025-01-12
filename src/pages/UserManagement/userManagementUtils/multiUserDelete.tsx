import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import { GetUsersData } from '../../../store/usersSlice';
import showDeleteMesssage from './showDeleteMessage';

const handleMultiUserDelete = async (selectedUsers: { id: string }[], dispatch: Dispatch<AnyAction>, setSelectedrecords: any): Promise<boolean> => {
    const isConfirmed = await showDeleteMesssage(dispatch);
    if (!isConfirmed) {
        return false;
    }

    const promises = selectedUsers.map((user) => {
        return axiosInstance.delete(`/users/${user.id}`);
    });

    const results = await Promise.allSettled(promises);

    const failedDeletes = results.filter((result) => result.status === 'rejected');
    if (failedDeletes.length > 0) {
        console.error('Failed to delete users:', failedDeletes);
    }

    dispatch(GetUsersData() as any);
    setSelectedrecords([]);
    return true;
};

export default handleMultiUserDelete;
