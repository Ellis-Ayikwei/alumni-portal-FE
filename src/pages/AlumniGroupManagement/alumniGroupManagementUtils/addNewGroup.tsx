import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { eye } from 'react-icons-kit/feather/eye';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { useDispatch } from 'react-redux';
import Select from 'react-select';
import useSwr from 'swr';
import 'tippy.js/dist/tippy.css';
import IconX from '../../../components/Icon/IconX';
import axiosInstance from '../../../helper/axiosInstance';
import fetcher from '../../../helper/fetcher';
import showMessage from '../../UserManagement/userManagementUtils/showMessage';
import { GetAlumniData } from '../../../store/alumnigroupSlice';
import ShowRequestError from '../../../helper/showRequestError';

export const dParams = {
    name: '',
    start_date: '',
    end_date: '',
    school: '',
    status: 'ACTIVATED',
    package_id: '',
};

interface AddNewAlumniGroupProps {
    AddUserModal: boolean;
    setAddUserModal: (value: boolean) => void;
}

const AddNewAlumniGroup = ({ AddUserModal, setAddUserModal }: AddNewAlumniGroupProps) => {
    const dispatch = useDispatch();
    const [value, setValue] = useState<any>('list');
    const [defaultParams, setDefaultParams] = useState({ ...dParams });
    const [params, setParams] = useState<{ [key: string]: string }>({ ...dParams });
    const { data: users_data, error: users_error, isLoading: users_loadng } = useSwr('/users', fetcher);
    const { data: packages_data, error: packages_error, isLoading: packages_loadng } = useSwr('/insurance_packages', fetcher);

    const insurance_packages = packages_data?.map((pkg: any) => {
        return { value: pkg.id, label: pkg.name };
    });
    const users = users_data?.map((user: any) => {
        return { value: user.id, label: `${user.first_name} ${user.last_name}`, icon: <FontAwesomeIcon icon={faUser} /> };
    });

    const ContractStatus = [
        { value: 'ACTIVATED', label: 'ACTIVE' },
        { value: 'LOCKED', label: 'LOCKED' },
    ];


    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
        console.log('params', params);
    };

 
 
  
    const SaveNewGroup = async () => {
        const requiredFields = [
            { field: 'name', message: 'Group name is required.' },
            { field: 'school', message: 'Group school is required.' },
            { field: 'start_date', message: 'Group start date is required.' },
            { field: 'end_date', message: 'Group end date is required.' },
        ];

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
        console.log('payload', payload);

        try {
            const response = await axiosInstance.post('/alumni_groups', payload);
            if (response.status === 201) {
                showMessage(`Group Created Successfully.`, 'success');
                setParams(defaultParams);
                dispatch(GetAlumniData() as any);
                setAddUserModal(false);
            }
        } catch (error: any) {
            ShowRequestError(error)
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
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-y-scroll w-full max-w-lg text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => setAddUserModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    <h4>Add Alumni Group</h4>
                                </div>
                                <div className="p-5">
                                    <form>
                                        <div className="mb-5">
                                            <label htmlFor="name">
                                                Name <span className="text-red-600">*</span>
                                            </label>
                                            <input id="name" type="text" placeholder="Enter Name" className="form-input" value={params.name} onChange={(e) => changeValue(e)} required />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="school">
                                                School <span className="text-red-600">*</span>
                                            </label>
                                            <input id="school" type="text" placeholder="Enter School Name" className="form-input" value={params.school} onChange={(e) => changeValue(e)} required />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="start_date">
                                                Start Date <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                id="start_date"
                                                type="date"
                                                placeholder="Enter Start Date"
                                                className="form-input"
                                                value={params.start_date}
                                                onChange={(e) => changeValue(e)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="end_date">
                                                End Date <span className="text-red-600">*</span>
                                            </label>
                                            <input id="end_date" type="date" placeholder="Enter End Date" className="form-input" value={params.end_date} onChange={(e) => changeValue(e)} required />
                                        </div>
                                        {/* <div className="mb-5">
                                            <label htmlFor="president">President</label>
                                            <Select
                                                defaultValue={params.president_user_id}
                                                id="president_id"
                                                options={users}
                                                isSearchable={false}
                                                onChange={(e: any) => setParams({ ...params, president_user_id: e?.value })}
                                            />
                                        </div> */}
                                        <div className="mb-5">
                                            <label htmlFor="insurance_package">Insurance Package</label>
                                            <Select
                                                defaultValue={params.package_id}
                                                id="package_id"
                                                options={insurance_packages}
                                                isSearchable={false}
                                                onChange={(e: any) => setParams({ ...params, package_id: e.value })}
                                                isClearable={true}
        
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="status">
                                                Status <span className="text-red-600">*</span>
                                            </label>
                                            <Select
                                                defaultValue={params.status}
                                                id="status"
                                                options={ContractStatus}
                                                isSearchable={false}
                                                onChange={(e: any) => setParams({ ...params, status: e?.value })}
                                                escapeClearsValue={true}
                                                isClearable={true}
                                            
                                            />
                                        </div>

                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAddUserModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={SaveNewGroup}>
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

export default AddNewAlumniGroup;
