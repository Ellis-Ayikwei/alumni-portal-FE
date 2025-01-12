import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import { GetUsersData } from '../../../store/usersSlice';

const handleMultiUserActivation = async (selectedUsers: { id: string }[], dispatch: Dispatch<AnyAction>): Promise<boolean> => {
    const promises = selectedUsers.map((user) =>
        axiosInstance.put(`/users/${user.id}`, {
            is_active: true,
        })
    );

    await Promise.all(promises);

    dispatch(GetUsersData() as any);

    return true;
};

export default handleMultiUserActivation;
