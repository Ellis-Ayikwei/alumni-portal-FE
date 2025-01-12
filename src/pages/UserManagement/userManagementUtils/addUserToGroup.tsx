import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Select, { StylesConfig } from 'react-select';
import useSwr from 'swr';
import 'tippy.js/dist/tippy.css';
import IconX from '../../../components/Icon/IconX';
import fetcher from '../../../helper/fetcher';

interface AddUserToGroupProps {
    AddUserToGroupModal: boolean;
    setAddUserToGroupModal: (value: boolean) => void;
    usersToAddToALumniGroup: any;
}

const roles = [
    { value: 'SUPER_ADMIN', label: 'Super Admin', isDisabled: 'option--is-disabled' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'REGULAR', label: 'Regular' },
    { value: 'UNDERWRITER', label: 'Underwriter' },
    { value: 'PREMIUM_ADMIN', label: 'Premium Admin' },
    { value: 'SALES', label: 'Sales' },
    { value: 'MEMBER', label: 'Member' },
    { value: 'UNDERWRITER', label: 'Underwriter' },
    { value: 'PREMIUM_ADMIN', label: 'Premium Admin' },
    { value: 'SALES', label: 'Sales' },
    { value: 'MEMBER', label: 'Member' },
    { value: 'UNDERWRITER', label: 'Underwriter' },
    { value: 'PREMIUM_ADMIN', label: 'Premium Admin' },
    { value: 'SALES', label: 'Sales' },
    { value: 'MEMBER', label: 'Member' },
];

const AddUserToGroup = ({ AddUserToGroupModal, setAddUserToGroupModal, usersToAddToALumniGroup }: AddUserToGroupProps) => {
    console.log(usersToAddToALumniGroup);
    const { data: allGroups, error: GroupsError } = useSwr(`/alumni_groups`, fetcher);

    const groups = allGroups?.map((item: any) => {return{ value: item.id, label: item.name }});

    const colourStyles: StylesConfig<any, true> = {
        menuList: (provided, state) => ({
            ...provided,
            height: '200px',
        }),
    };

    const users = usersToAddToALumniGroup.map((item: any) => {
        return item.username;
    });

    return (
        <Transition appear show={AddUserToGroupModal} as={Fragment}>
            <Dialog as="div" open={AddUserToGroupModal} onClose={() => setAddUserToGroupModal(false)} className="relative z-[51]">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8 ">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg  w-full  h-fit max-w-lg text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => setAddUserToGroupModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">{'Add User To An Alumni Group'}</div>
                                <div className="p-5">
                                    Add user(s)
                                    <div className="font-medium text-xl mb-1">
                                        {usersToAddToALumniGroup.map((item: any) => {
                                            return <p>{item.username}</p>;
                                        })}
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="role">To Group(s)</label>
                                        <Select id="role" options={groups} isSearchable={true} required styles={colourStyles} hideSelectedOptions={true} isMulti />
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddUserToGroup;
