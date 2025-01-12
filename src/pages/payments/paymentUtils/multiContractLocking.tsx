import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import { GetContractsData } from '../../../store/contractsSlice';

const handleMultiContractLocking = async (selectedContracts: { id: string }[], dispatch: Dispatch<AnyAction>): Promise<boolean> => {
    const promises = selectedContracts.map((contract) =>
        axiosInstance.put(`/contracts/${contract.id}`, {
            status: 'LOCKED',
        })
    );

    await Promise.all(promises);

    dispatch(GetContractsData() as any);
    return true;
};

export default handleMultiContractLocking;
