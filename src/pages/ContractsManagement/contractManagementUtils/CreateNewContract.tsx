import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import 'tippy.js/dist/tippy.css';
import IconLoader from '../../../components/Icon/IconLoader';
import IconX from '../../../components/Icon/IconX';
import axiosInstance from '../../../helper/axiosInstance';
import { IRootState } from '../../../store';
import { GetAlumniData } from '../../../store/alumnigroupSlice';
import { GetContractsData } from '../../../store/contractsSlice';
import { GetInsurancePackages } from '../../../store/insurancePackageSlice';
import showMessage from './showMessage';

import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import ShowRequestError from '../../../helper/showRequestError';

export const dParams = {
    id: null,
    name: '',
    email: '',
    phone: '',
    role: 'REGULAR',
    location: '',
    username: '',
    password: '',
    password1: '',
    password2: '',
    department: '',
    job_title: '',
    first_name: '',
    last_name: '',
    other_names: '',
    address: '',
    gender: '',
    marital_status: '',
    date_of_birth: '',
    state_of_origin: '',
    local_government: '',
    blood_group: '',
    genotype: '',
    height: '',
    weight: '',
    eye_color: '',
    hair_color: '',
    skin_tone: '',
    physical_challenge: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_email: '',
    next_of_kin_name: '',
    next_of_kin_phone: '',
    next_of_kin_email: '',
    next_of_kin_address: '',
    next_of_kin_relationship: '',
    bank_name: '',
    bank_account_number: '',
    sort_code: '',
    account_type: '',
    bvn: '',
    nin: '',
    image: '',
    medical_history: '',
    medical_history_description: '',
    medical_history_date: '',
    medical_history_doctor_name: '',
    medical_history_doctor_phone: '',
    medical_history_doctor_email: '',
    medical_history_doctor_address: '',
};

interface SaveNewUserProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
}

const CreateNewContract = ({ showModal, setShowModal }: SaveNewUserProps) => {
    const auth = useAuthUser<{ id: string }>();
    const alumniGroups = useSelector((state: IRootState) => state.alumnidata.alumniGroups);
    const { insurancePackages, loading, error } = useSelector((state: IRootState) => state.insurancePackages) || { insurancePackages: [] };
    const dispatch = useDispatch();
    const [defaultParams, setDefaultParams] = useState({ ...dParams });
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const userId = auth?.id;

    useEffect(() => {
        dispatch(GetAlumniData as any);
    }, [dispatch, alumniGroups]);

    useEffect(() => {
        dispatch(GetInsurancePackages() as any);
        console.log(' the goten insurance packages', insurancePackages);
    }, [dispatch]);

    const groups = Object.values(alumniGroups)?.map((group: any) => ({ value: group?.id, label: group?.name }));

    const insurance_packages = Object.values(insurancePackages)?.map((insurance: any) => ({ value: insurance.id, label: insurance?.name }));

    const ContractStatus = [
        { value: 'ACTIVE', label: 'ACTIVE' },
        { value: 'INACTIVE', label: 'INACTIVE' },
        { value: 'EXPIRED', label: 'EXPIRED' },
        { value: 'TERMINATED', label: 'TERMINATED' },
    ];

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        console.log('value', value);
        setParams({ ...params, [id]: value });
    };

    const SaveNewContract = async () => {
        setIsSaveLoading(true);

        const requiredFields = [
            { field: 'group_id', message: 'Group name is required.' },
            { field: 'expiry_date', message: 'Expiry Date is required.' },
            // { field: 'status', message: 'Status is required.' },
            { field: 'insurance_package_id', message: 'Insurance Package is required.' },
        ];

        for (let { field, message } of requiredFields) {
            if (!params[field]) {
                showMessage(message, 'error');
                setIsSaveLoading(false);
                return true;
            }
        }

        const payload = JSON.stringify({ ...params, underwriter_id: userId });

        try {
            const response = await axiosInstance.post('/contracts', payload);
            if (response.status === 201) {
                showMessage(`Contract Created Successfully.`, 'success');
                setParams(defaultParams);
                dispatch(GetContractsData() as any);
                setIsSaveLoading(false);
                setShowModal(false);
            }
        } catch (error: any) {
            ShowRequestError(error)
            setIsSaveLoading(false);
        } finally {
            setIsSaveLoading(false);
        }
    };

    return (
        <Transition appear show={showModal} as={Fragment}>
            <Dialog as="div" open={showModal} onClose={() => setShowModal(false)} className="relative z-[51]">
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
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-y-scroll w-full max-w-lg text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    {params?.id ? 'Edit Contract' : 'Add Contract'}
                                </div>
                                <div className="p-5">
                                    <form>
                                        <div className="mb-5">
                                            <label htmlFor="name">Name</label>
                                            <input id="name" type="text" placeholder="ie. contract for alumni group 2" className="form-input" value={params?.name} onChange={(e) => changeValue(e)} />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="group_id">
                                                Alumni Group <span className="text-red-600">*</span>
                                            </label>
                                            <Select
                                                defaultValue={params.group_id}
                                                id="group_id"
                                                options={groups}
                                                isSearchable={true}
                                                onChange={(e) => setParams({ ...params, group_id: e?.value })}
                                                isClearable={true}
                                                required
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="expiry_date">
                                                Expiry Date <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                id="expiry_date"
                                                type="date"
                                                placeholder="Enter Expiry Date"
                                                className="form-input"
                                                value={params.expiry_date}
                                                onChange={(e) => changeValue(e)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="data_effective">Date Effective</label>
                                            <input
                                                id="date_effective"
                                                type="date"
                                                placeholder="Enter Expiry Date"
                                                className="form-input"
                                                value={params.data_effective}
                                                onChange={(e) => changeValue(e)}
                                            />
                                        </div>
                                        {/* <div className="mb-5">
                                            <label htmlFor="signed_date">Signed Date</label>
                                            <input id="signed_date" type="date" placeholder="Enter Signed Date" className="form-input" value={params.signed_date} onChange={(e) => changeValue(e)} />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="policy_number">Policy Number</label>
                                            <input
                                                id="policy_number"
                                                type="text"
                                                placeholder="Enter policy number"
                                                className="form-input"
                                                value={params.policy_number}
                                                onChange={(e) => changeValue(e)}
                                            />
                                        </div> */}
                                        <div className="mb-5">
                                            <label htmlFor="description">Contract Description</label>
                                            <textarea
                                                id="description"
                                                placeholder="Enter Enter Contract Description"
                                                className="form-input"
                                                value={params.description}
                                                onChange={(e) => changeValue(e)}
                                            />
                                        </div>
                                        {/* <div className="mb-5">
                                            <label htmlFor="status">
                                                Status <span className="text-red-600">*</span>
                                            </label>
                                            <Select
                                                defaultValue={params.status}
                                                id="status"
                                                options={Object.values(ContractStatus)}
                                                isSearchable={false}
                                                onChange={(e) => setParams({ ...params, status: e?.value })}
                                                required
                                            />
                                        </div> */}
                                        {/* <div className="mb-5">
                                            <label htmlFor="underwriter_id">
                                                Underwriter <span className="text-red-600">*</span>
                                            </label>
                                            <Select
                                                defaultValue={params.underwriter_id}
                                                id="underwriter_id"
                                                options={users}
                                                isSearchable={true}
                                                onChange={(e) => setParams({ ...params, underwriter_id: e?.value })}
                                                required
                                            />
                                        </div> */}
                                        <div className="mb-5">
                                            <label htmlFor="insurance_package_id">
                                                Insurance Package <span className="text-red-600">*</span>
                                            </label>
                                            <Select
                                                defaultValue={params.insurance_package_id}
                                                id="insurance_package_id"
                                                options={insurance_packages}
                                                isSearchable={true}
                                                onChange={(e) => setParams({ ...params, insurance_package_id: e?.value })}
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setShowModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" onClick={SaveNewContract} className="btn btn-success ltr:ml-4 rtl:mr-4">
                                                {!isSaveLoading ? 'Add' : <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" />}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default CreateNewContract;
