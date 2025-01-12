import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, Transition } from '@headlessui/react';
import dayjs from 'dayjs';
import { Fragment } from 'react';
import IconX from '../../../components/Icon/IconX';
import { renderStatus } from '../../../helper/renderStatus';

interface ChangeLogProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    changeLog: any;
}

const ChangeLog = ({ showModal, setShowModal, changeLog }: ChangeLogProps) => {
    const { newValues, oldValues } = changeLog || {};
    console.log('new values', typeof newValues);
    console.log('old values', oldValues);

    console.log('the changelog', changeLog);

    return (
        <Transition appear show={showModal} as={Fragment}>
            <Dialog as="div" open={showModal} onClose={() => setShowModal(false)}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 z-[999] bg-[black]/60">
                    <div className="flex min-h-screen items-start justify-center px-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel my-8 w-full max-w-5xl lg:max-h-[90svh] rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <h5 className="text-lg font-bold">Change Log</h5>
                                    <button onClick={() => setShowModal(false)} type="button" className="text-white-dark hover:text-dark">
                                        <IconX />
                                    </button>
                                </div>
                                <div className="px-5">
                                    <div className=" grid grid-cols-1 gap-5 md:grid-cols-2 max-h-[70svh] overflow-y-scroll ">
                                        <div className="gap-2">
                                            <div className="">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-2xl">Old Values</h4>
                                                    <div className=" py-0 px-2 text-2xl  flex items-center justify-center rtl:mr-auto ltr:ml-auto">
                                                        <FontAwesomeIcon icon={faArrowRight} className="text-success " />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel gap-5 flex flex-col bg-red-50">
                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Name</span>
                                                    <span className="block text-sm dark:text-gray-300">{oldValues?.name}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Description</span>
                                                    <span className="block text-sm dark:text-gray-300">{oldValues?.description ?? 'N/A'}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Expiry Date</span>
                                                    <span className="block text-sm dark:text-gray-300">{oldValues?.expiry_date ? dayjs(oldValues?.expiry_date).format('ddd DD MMM YYYY') : 'N/A'}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Date Effective</span>
                                                    <span className="block text-sm dark:text-gray-300">
                                                        {oldValues?.date_effective ? dayjs(oldValues?.date_effective).format('ddd DD MMM YYYY') : 'N/A'}
                                                    </span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Is Signed</span>
                                                    <span className="block text-sm dark:text-gray-300">{oldValues?.is_signed ? 'Yes' : 'No'}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Signed Date</span>
                                                    <span className="block text-sm dark:text-gray-300">{dayjs(oldValues?.created_at).format('ddd DD MMM YYYY') ?? 'N/A'}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Status</span>
                                                    <span className="block text-sm dark:text-gray-300 w-fit">{renderStatus(oldValues?.status)}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Insurance Package</span>
                                                    <span className="block text-sm dark:text-gray-300">{oldValues?.insurance_package.name ?? 'N/A'}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Policy Number</span>
                                                    <span className="block text-sm dark:text-gray-300">{oldValues?.policy_number ?? 'N/A'}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Amendment ID</span>
                                                    <span className="block text-sm dark:text-gray-300">{oldValues?.id}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Change Date</span>
                                                    <span className="block text-sm dark:text-gray-300">{dayjs(oldValues?.created_at).format('ddd DD MMM YYYY')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="gap-2">
                                            <div className="">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-2xl">New Values</h4>
                                                </div>
                                            </div>
                                            <div className="panel gap-5 flex flex-col bg-green-50">
                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Name</span>
                                                    <span className="block text-sm dark:text-gray-300">{newValues?.name}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Description</span>
                                                    <span className="block text-sm dark:text-gray-300">{newValues?.description ?? 'N/A'}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Expiry Date</span>
                                                    <span className="block text-sm dark:text-gray-300">{newValues?.expiry_date ? dayjs(newValues?.expiry_date).format('ddd DD MMM YYYY') : 'N/A'}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Date Effective</span>
                                                    <span className="block text-sm dark:text-gray-300">
                                                        {newValues?.date_effective ? dayjs(newValues?.date_effective).format('ddd DD MMM YYYY') : 'N/A'}
                                                    </span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Is Signed</span>
                                                    <span className="block text-sm dark:text-gray-300">{newValues?.is_signed ? 'Yes' : 'No'}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Signed Date</span>
                                                    <span className="block text-sm dark:text-gray-300">{dayjs(newValues?.created_at).format('ddd DD MMM YYYY') ?? 'N/A'}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Status</span>
                                                    <span className="block text-sm dark:text-gray-300 w-fit">{renderStatus(newValues?.status)}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Insurance Package</span>
                                                    <span className="block text-sm dark:text-gray-300">{newValues?.insurance_package.name ?? 'N/A'}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Contract Policy Number</span>
                                                    <span className="block text-sm dark:text-gray-300">{newValues?.policy_number ?? 'N/A'}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Amendment ID</span>
                                                    <span className="block text-sm dark:text-gray-300">{newValues?.id}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Change Date</span>
                                                    <span className="block text-sm dark:text-gray-300">{dayjs(newValues?.created_at).format('ddd DD MMM YYYY')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 mb-5 flex items-center justify-end">
                                        <button onClick={() => setShowModal(false)} type="button" className="btn btn-outline-danger">
                                            <IconX /> Close
                                        </button>
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

export default ChangeLog;
