import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import { GetContractsData } from '../../../store/contractsSlice';

const handleMultiContractDeActivation = async (selectedContracts: { id: string }[], dispatch: Dispatch<AnyAction>): Promise<boolean> => {
    const promises = selectedContracts.map((contract) =>
        axiosInstance.put(`/contracts/${contract.id}`, {
            status: 'INACTIVE',
            
        })
    );

    const results = await Promise.allSettled(promises);

    const failedActivations = results.filter((result) => result.status === 'rejected');
    if (failedActivations.length > 0) {
        failedActivations.forEach((result: any) => {
            if (result.status === 'rejected') {
                console.log('Failed to activate contract:', result.reason?.response?.data?.message || result.reason);
            }
        });
    }

    dispatch(GetContractsData() as any);

    return true;
};

export default handleMultiContractDeActivation;
