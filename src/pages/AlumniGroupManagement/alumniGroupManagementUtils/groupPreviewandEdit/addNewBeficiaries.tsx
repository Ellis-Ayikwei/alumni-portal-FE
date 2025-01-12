import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { eye } from 'react-icons-kit/feather/eye';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { useDispatch } from 'react-redux';
import Select from 'react-select';
import useSwr, { mutate } from 'swr';
import 'tippy.js/dist/tippy.css';
import IconLoader from '../../../../components/Icon/IconLoader';
import IconX from '../../../../components/Icon/IconX';
import axiosInstance from '../../../../helper/axiosInstance';
import fetcher from '../../../../helper/fetcher';
import showMessage from '../../../UserManagement/userManagementUtils/showMessage';

export const dParams = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    other_names: '',
    date_of_birth: '',
    benefactor_user_id: '',
    group_member_id: '',
    relationship_type: '',
};

const relationshiptype = [
    { value: 'SPOUSE', label: 'SPOUSE' },
    { value: 'CHILD', label: 'CHILD' },
    { value: 'PARENT', label: 'PARENT' },
    { value: 'SIBLING', label: 'SIBLING' },
    { value: 'OTHER', label: 'OTHER' },
];

interface AddNewBeneficiariesProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    benefactorIds?: {
        userId: string;
        memberId: string;
    };
}

const AddNewBeneficiaries = ({ showModal, setShowModal, benefactorIds }: AddNewBeneficiariesProps) => {
    const { userId, memberId } = benefactorIds || {};

    const dispatch = useDispatch();
    const [value, setValue] = useState<any>('list');
    const [defaultParams, setDefaultParams] = useState({ ...dParams });
    const [params, setParams] = useState<{ [key: string]: string }>({ ...dParams });
    const { data: users_data, error: users_error, isLoading: users_loadng } = useSwr('/users', fetcher);
    const { data: packages_data, error: packages_error, isLoading: packages_loadng } = useSwr('/insurance_packages', fetcher);
    const [isSavedLoading, setIsSaveLoading] = useState(false);

    console.log('the users data', users_data);

    const insurance_packages = packages_data?.map((pkg: any) => {
        return { value: pkg.id, label: pkg.name };
    });
    const users = users_data?.map((user: any) => {
        return { value: user.id, label: `${user.first_name} ${user.last_name}`, icon: <FontAwesomeIcon icon={faUser} /> };
    });

    const ContractStatus = [
        { value: 'ACTIVE', label: 'ACTIVE' },
        { value: 'LOCKED', label: 'LOCKED' },
        { value: 'EXPIRED', label: 'EXPIRED' },
        { value: 'TERMINATED', label: 'TERMINATED' },
    ];

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
        console.log('params', params);
    };

    const [password, setPassword] = useState('');
    const [type, setType] = useState('password');
    const [icon, setIcon] = useState(eyeOff);

    const handleToggle = () => {
        if (type === 'password') {
            setIcon(eye);
            setType('text');
        } else {
            setIcon(eyeOff);
            setType('password');
        }
    };

    const handlePasswordChange = (e: any) => {
        setPassword(e.target.value);
    };

    const SaveNewbeneficiary = async () => {
        console.log('params', params);
        setIsSaveLoading(true);
        const requiredFields = [
            { field: 'first_name', message: 'First name is required.' },
            { field: 'last_name', message: 'Last name is required.' },
            { field: 'email', message: 'Email is required.' },
        ];

        for (let { field, message } of requiredFields) {
            if (!params[field]) {
                showMessage(message, 'error');
                setIsSaveLoading(false);
                return true;
            }
        }

        if (params.password !== params.password1) {
            showMessage('Passwords do not match.', 'error');
            setIsSaveLoading(false);
            return true;
        }
        const payload = JSON.stringify({ ...params, benefactor_user_id: userId || params.benefactor_user_id, group_member_id: memberId || params.group_member_id });
        console.log('payload', payload);

        try {
            const response = await axiosInstance.post('/beneficiaries', payload);
            if (response.status === 201) {
                showMessage(`Lives Added Successfully.`, 'success');
                setParams(defaultParams);
                setIsSaveLoading(false);
                setShowModal(false);
                mutate(`/users/${userId}/beneficiaries`);
            }
        } catch (error: any) {
            if (error.response?.data) {
                const parser = new DOMParser();
                const errorData = error.response.data;
                const doc = parser.parseFromString(errorData, 'text/html');
                const errorMess = doc.querySelector('body')?.innerText || 'An error occurred';
                const errorMessage = errorMess.split('\n')[1];
                console.error('Error:', errorMessage);
                showMessage(`${errorMessage}`, 'error');
            }
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
                                    <h4>Add Life</h4>
                                </div>
                                <div className="p-5">
                                    <form>
                                        <div className="mb-5">
                                            <label htmlFor="first_name">
                                                First Name <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                id="first_name"
                                                type="text"
                                                placeholder="Enter First Name"
                                                className="form-input"
                                                value={params.first_name}
                                                onChange={(e) => changeValue(e)}
                                                required
                                            />
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="last_name">
                                                Last Name <span className="text-red-600">*</span>
                                            </label>
                                            <input id="last_name" type="text" placeholder="Enter Last Name" className="form-input" value={params.last_name} onChange={(e) => changeValue(e)} required />
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="email">
                                                Email <span className="text-red-600">*</span>
                                            </label>
                                            <input id="email" type="email" placeholder="Enter Email" className="form-input" value={params.email} onChange={(e) => changeValue(e)} required />
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input id="phone" type="tel" placeholder="Enter Phone Number" className="form-input" value={params.phone} onChange={(e) => changeValue(e)} />
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="address">Address</label>
                                            <textarea id="address" placeholder="Enter Address" className="form-input" value={params.address} onChange={(e) => changeValue(e)} />
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="other_names">Other Names</label>
                                            <input id="other_names" type="text" placeholder="Enter Other Names" className="form-input" value={params.other_names} onChange={(e) => changeValue(e)} />
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="date_of_birth">Date of Birth</label>
                                            <input id="date_of_birth" type="date" className="form-input" value={params.date_of_birth} onChange={(e) => changeValue(e)} />
                                        </div>

                                        {!benefactorIds && (
                                            <div className="mb-5">
                                                <label htmlFor="insurance_package">Benefactor</label>
                                                <Select
                                                    defaultValue={params.benefactor_user_id}
                                                    id="package_id"
                                                    options={users}
                                                    isSearchable={true}
                                                    onChange={(e: any) => setParams({ ...params, benefactor_user_id: e.value })}
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div className="mb-5">
                                            <label htmlFor="insurance_package">Relationship Type</label>
                                            <Select
                                                defaultValue={params.relationship_type}
                                                id="relationship_type"
                                                options={relationshiptype}
                                                isSearchable={true}
                                                onChange={(e: any) => setParams({ ...params, relationship_type: e.value })}
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setShowModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => SaveNewbeneficiary()}>
                                                {isSavedLoading ? <IconLoader className="animate-[spin_2s_linear_infinite] inline-block align-middle ltr:mr-2 rtl:ml-2 shrink-0" /> : 'add'}
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

export default AddNewBeneficiaries;
