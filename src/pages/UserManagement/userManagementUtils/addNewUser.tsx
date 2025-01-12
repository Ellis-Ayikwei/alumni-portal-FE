import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Icon } from 'react-icons-kit';
import { eye } from 'react-icons-kit/feather/eye';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import PasswordChecklist from 'react-password-checklist';
import { useDispatch } from 'react-redux';
import Select from 'react-select';
import 'tippy.js/dist/tippy.css';
import IconX from '../../../components/Icon/IconX';
import axiosInstance from '../../../helper/axiosInstance';
import { GetUsersData } from '../../../store/usersSlice';
import showMessage from './showMessage';

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

const roles = [
    { value: 'SUPER_ADMIN', label: 'Super Admin', isDisabled: 'option--is-disabled' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'REGULAR', label: 'Regular' },
    { value: 'UNDERWRITER', label: 'Underwriter' },
    { value: 'PREMIUM_ADMIN', label: 'Premium Admin' },
    { value: 'SALES', label: 'Sales' },
    { value: 'MEMBER', label: 'Member' },
];

interface SaveNewUserProps {
    AddUserModal: boolean;
    setAddUserModal: (value: boolean) => void;
}

const AddNewUser = ({ AddUserModal, setAddUserModal }: SaveNewUserProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch();

    const [value, setValue] = useState<any>('list');
    const [defaultParams, setDefaultParams] = useState({ ...dParams });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        console.log('value', value);
        setParams({ ...params, [id]: value });
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

    const requiredFields = [
        { field: 'first_name', message: 'First Name is required.' },
        { field: 'email', message: 'Email is required.' },
        { field: 'phone', message: 'Phone is required.' },
        { field: 'username', message: 'Username is required.' },
        { field: 'password', message: 'Password is required.' },
        { field: 'password1', message: 'Confirm Password is required.' },
        { field: 'dob', message: 'Date of Birth is required.' },
        { field: 'role', message: 'Occupation is required.' },
    ];

    const saveNewUser = async () => {
        for (let { field, message } of requiredFields) {
            if (!params[field]) {
                showMessage(message, 'error');
                return true;
            }
        }

        if (params.password !== params.password1) {
            showMessage('Passwords do not match.', 'error');
            return true;
        }

        const payload = JSON.stringify({ ...params });

        try {
            const response = await axiosInstance.post('/users', payload);
            if (response.status === 201) {
                showMessage(`User created successfully.`, 'success');
                setParams(defaultParams);
                dispatch(GetUsersData() as any);
                setAddUserModal(false);
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                const parser = new DOMParser();
                const errorData = error.response.data;
                const doc = parser.parseFromString(errorData, 'text/html');
                const errorMess = doc.querySelector('body')?.innerText || 'An error occurred';
                const errorMessage = errorMess.split('\n')[1];
                console.error('Error:', errorMessage);
                showMessage(`${errorMessage}`, 'error');
            }
        } finally {
            // setParams(defaultParams);
        }
    };
    return (
        <Transition appear show={AddUserModal} as={Fragment}>
            <Dialog as="div" open={AddUserModal} onClose={() => setAddUserModal(false)} className="relative z-[51]">
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
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => setAddUserModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">{params.id ? 'Edit Contact' : 'Add User'}</div>
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
                                            <label htmlFor="other_names">Other Names</label>
                                            <input id="other_names" type="text" placeholder="Enter Other Names" className="form-input" value={params.other_names} onChange={(e) => changeValue(e)} />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="username">
                                                Username <span className="text-red-600">*</span>
                                            </label>
                                            <input id="username" type="text" placeholder="Enter Username" className="form-input" value={params.username} onChange={(e) => changeValue(e)} required />
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="email">
                                                Email <span className="text-red-600">*</span>
                                            </label>
                                            <input id="email" type="email" placeholder="Enter Email" className="form-input" value={params.email} onChange={(e) => changeValue(e)} required />
                                        </div>

                                        <div>
                                            <label htmlFor="dateOfBirth">
                                                Date Of Birth: <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                id="dob"
                                                type="date"
                                                name="dob"
                                                className="form-input"
                                                placeholder="Date Of Birth"
                                                value={params.dob || ''}
                                                onChange={(event: any) => changeValue(event)}
                                                required
                                            />
                                            <div className="text-danger mt-2" id="startDateErr"></div>
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="gender">
                                                Gender <span className="text-red-600">*</span>
                                            </label>
                                            <Select id="gender" options={
                                                [{value:"Male",label:"Male"},{value:"Female",label:"Female"}]
                                            } isSearchable={false} onChange={(e) => setParams({ ...params, gender: e?.value })} required />
                                        </div>


                                        {/* <div className="mb-5">
                                        <label htmlFor="password1">Email</label>
                                        <input id="password1" type="password" placeholder="Enter Email" className="form-input" value={params.email} onChange={(e) => changeValue(e)} />
                                    </div> */}

                                        <div className="mb-4">
                                            <label htmlFor="password1">
                                                Password <span className="text-red-600">*</span>
                                            </label>
                                            <div className="flex">
                                                <input
                                                    type={type}
                                                    name="password1"
                                                    id="password1"
                                                    placeholder="Password"
                                                    className="form-input"
                                                    value={params.password1}
                                                    onChange={(e) => changeValue(e)}
                                                    autoComplete="current-password"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-7">
                                            <label htmlFor="password2">
                                                Confirm password <span className="text-red-600">*</span>
                                            </label>
                                            <div className="">
                                                <input
                                                    type={type}
                                                    name="password2"
                                                    id="password2"
                                                    placeholder="Re-Type Password"
                                                    className="form-input w-full"
                                                    value={params.password2}
                                                    onChange={(e) => changeValue(e)}
                                                    autoComplete="current-password"
                                                    required
                                                />
                                                <div className="text-right mt-2">
                                                    {' '}
                                                    <span className="cursor-pointer text-gray-500 flex items-center justify-end" onClick={handleToggle}>
                                                        show
                                                        <Icon className="ml-1" icon={icon} size={16} />
                                                    </span>
                                                </div>
                                            </div>

                                            {params.password1 && (
                                                <PasswordChecklist
                                                    rules={['minLength', 'specialChar', 'number', 'capital', 'match']}
                                                    minLength={8}
                                                    value={params.password1}
                                                    valueAgain={params.password2}
                                                    onChange={() => setParams({ ...params, password: params.password1 })}
                                                />
                                            )}
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="role">
                                                Role <span className="text-red-600">*</span>
                                            </label>
                                            <Select defaultValue={roles[2]} id="role" options={roles} isSearchable={false} onChange={(e) => setParams({ ...params, role: e?.value })} required />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="phone">
                                                Phone Number <span className="text-red-600">*</span>
                                            </label>
                                            <input id="phone" type="text" placeholder="Enter Phone Number" className="form-input" value={params.phone} onChange={(e) => changeValue(e)} required />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="role">
                                                Occupation <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                id="occupation"
                                                type="text"
                                                placeholder="Enter Occupation"
                                                className="form-input"
                                                value={params.occupation}
                                                onChange={(e) => changeValue(e)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="location">
                                                Address <span className="text-red-600">*</span>
                                            </label>
                                            <textarea
                                                id="address"
                                                rows={3}
                                                placeholder="Enter Address"
                                                className="form-textarea resize-none min-h-[130px]"
                                                value={params.address}
                                                onChange={(e) => changeValue(e)}
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddUserModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveNewUser}>
                                                Add
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

export default AddNewUser;
