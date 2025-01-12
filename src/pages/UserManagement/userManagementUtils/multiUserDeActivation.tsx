import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import { GetUsersData } from '../../../store/usersSlice';
import axiosInstance from '../../../helper/axiosInstance';

const handleMultiUserDeActivation = async (
    selectedUsers: { id: string }[],
    dispatch: Dispatch<AnyAction>
): Promise<boolean> => {
    const promises = selectedUsers.map((user) =>
        axiosInstance.put(`/users/${user.id}`, {
            is_active: false,
        })
    );

    await Promise.all(promises);

    dispatch(GetUsersData() as any);

    return true;
};

export default handleMultiUserDeActivation;
