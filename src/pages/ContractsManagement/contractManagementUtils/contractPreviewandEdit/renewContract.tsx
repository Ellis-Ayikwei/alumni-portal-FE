import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select, { StylesConfig } from 'react-select';
import { mutate } from 'swr';
import 'tippy.js/dist/tippy.css';
import IconLoader from '../../../../components/Icon/IconLoader';
import IconX from '../../../../components/Icon/IconX';
import axiosInstance from '../../../../helper/axiosInstance';
import ShowRequestError from '../../../../helper/showRequestError';
import { IRootState } from '../../../../store';
import { GetAlumniData } from '../../../../store/alumnigroupSlice';
import { GetInsurancePackages } from '../../../../store/insurancePackageSlice';
import { InputChangeEvent } from '../../../../types';
import { THREE_MONTHS_IN_MS } from './ContractPreview';
import { GetContractsData } from '../../../../store/contractsSlice';

export const dParams = {
    name: '',
    start_date: '',
    end_date: '',
    school: '',
    status: '',
    package_id: '',
    president_user_id: '',
};

interface MakePresidentProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    contractId: string;
}

const formatDateToISO = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString();
};

const RenewContract = ({ showModal, setShowModal, contractId }: MakePresidentProps) => {
    const dispatch = useDispatch();
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const { insurancePackages, loading, error: insurancePackagesError } = useSelector((state: IRootState) => state.insurancePackages) || { insurancePackages: [] };
    const [newContractData, setNewContractData] = useState<any>(null);

    const handleInputs = (e: InputChangeEvent) => {
        e.preventDefault();
        setNewContractData({ ...newContractData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        dispatch(GetInsurancePackages() as any);
    }, [dispatch]);

    const OptionStyles: StylesConfig<any, true> = {
        menuList: (provided, state) => ({
            ...provided,
            height: '150px',
        }),
    };

    const handleRenewContract = async () => {
        // if (!selectedOption) {
        //     showMessage('Please Select a Package.', 'error');
        //     return;
        // }

        try {
            setIsSaveLoading(true);
            const payload = {
                ...newContractData,
                package_id: selectedOption.value,
            };
            console.log(payload);
            const response = await axiosInstance.put(`/contracts/${contractId}/renew`, payload);
            console.log('the response', response);
            if (response.status === 200) {
                mutate(`/alumni_groups/${contractId}`);
                setShowModal(false);
                dispatch(GetContractsData() as any);
                setIsSaveLoading(true);
            }
        } catch (error: any) {
            console.log(error);
            ShowRequestError(error);
        } finally {
            setIsSaveLoading(false);
        }
    };

    return (
        <Transition appear show={showModal} as={Fragment}>
            <Dialog
                as="div"
                open={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedOption([]);
                }}
                className="relative z-[51]"
            >
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel border-0 p-0 h-full rounded-lg overflow-y-scroll w-full max-w-3xl h-80 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedOption([]);
                                    }}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    <h4>Renew Contract</h4>
                                </div>
                                <form>
                                    <div className="px-5 flex flex-col h-full p-5 gap-5">
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="expiry">
                                                    New Expiry Date: <span className="text-red-600">*</span>
                                                </label>
                                                <input id="expiry" type="date" name="expiry_date" onChange={(e) => handleInputs(e)} className="form-input" placeholder="Expiry Date" required />
                                            </div>
                                            <div>
                                                <label htmlFor="date-ffective">
                                                    Date Effective: <span className="text-red-600">*</span>
                                                </label>
                                                <input
                                                    id="date-ffective"
                                                    type="date"
                                                    onChange={(e) => handleInputs(e)}
                                                    name="date_effective"
                                                    className="form-input"
                                                    placeholder="Date Effective"
                                                    required
                                                    disabled={newContractData?.expiry_date == null}
                                                    max={
                                                        newContractData?.expiry_date
                                                            ? new Date(new Date(newContractData.expiry_date).getTime() - THREE_MONTHS_IN_MS).toISOString().split('T')[0]
                                                            : undefined
                                                    }
                                                />
                                            </div>
                                            <div className="mb-5 mt-5">
                                                <label htmlFor="role">Change Package</label>
                                                <Select
                                                    id="role"
                                                    options={Array.isArray(insurancePackages) ? insurancePackages.map((inp: any) => ({ label: inp.name, value: inp.id })) : []}
                                                    value={selectedOption}
                                                    isSearchable={true}
                                                    hideSelectedOptions
                                                    styles={OptionStyles}
                                                    isOptionDisabled={() => disabled}
                                                    onChange={(Selected: any) => setSelectedOption(Selected)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end items-center mt-auto">
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => {
                                                    setShowModal(false);
                                                    setSelectedOption([]);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-success ltr:ml-4 rtl:mr-4" onClick={handleRenewContract} disabled={isSaveLoading}>
                                                {isSaveLoading && <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" />}Renew Contract
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default RenewContract;
