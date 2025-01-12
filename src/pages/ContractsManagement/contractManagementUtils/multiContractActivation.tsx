import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import axiosInstance from '../../../helper/axiosInstance';
import ShowRequestError from '../../../helper/showRequestError';
import { GetContractsData } from '../../../store/contractsSlice';
import showMessage from './showMessage';

const handleMultiContractActivation = async (selectedContracts: { id: string }[], dispatch: Dispatch<AnyAction>, action: string): Promise<boolean> => {
    const promises = selectedContracts.map((contract) => {
        axiosInstance.put(`/contracts/${contract.id}`, {
            status: action,
        });

        if (action === 'renew') {
            axiosInstance.put(`/contracts/${contract.id}/renew`, {
                status: action,
                action: 'action',
            });
        }
    });

    const results = await Promise.allSettled(promises);

    const failedActivations = results.filter((result) => result.status === 'rejected');
    const successfulActivations = results.filter((result) => result.status === 'fulfilled');
    if (successfulActivations.length > 0) {
        successfulActivations.forEach((result: any) => {
            if (result.status === 'fulfilled') {
                showMessage(`Contracts made ${action} successfully`, 'success');
            }
        });
    }

    if (failedActivations.length > 0) {
        failedActivations.forEach((result: any) => {
            if (result.status === 'rejected') {
                console.log('Failed to activate contract:', result.reason?.response?.data);
                ShowRequestError(result.reason);
            }
        });
    }

    dispatch(GetContractsData() as any);

    return true;
};

export default handleMultiContractActivation;
