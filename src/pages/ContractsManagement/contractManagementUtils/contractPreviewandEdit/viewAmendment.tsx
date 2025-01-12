import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import IconX from '../../../../components/Icon/IconX';
import { renderStatus } from '../../../../helper/renderStatus';

interface ViewAmendmentProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
}

const ViewAmendment = ({ showModal, setShowModal }: ViewAmendmentProps) => {
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
                                    <h5 className="text-lg font-bold">Amendment</h5>
                                    <button onClick={() => setShowModal(false)} type="button" className="text-white-dark hover:text-dark">
                                        <IconX />
                                    </button>
                                </div>
                                <div className="p-5">
                                    <div className=" grid grid-cols-1 gap-5 md:grid-cols-2 max-h-[70svh] overflow-y-scroll">
                                        <div className="flex flex-col gap-5">
                                            <div className="space-y-1">
                                                <span className="block text-sm font-semibold dark:text-white">Amendment ID</span>
                                                <span className="block text-sm dark:text-gray-300">Column(String(60), ForeignKey('contracts.id'))</span>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="block text-sm font-semibold dark:text-white">Amended By</span>
                                                <span className="block text-sm dark:text-gray-300">Column(String(60), ForeignKey('users.id'))</span>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="block text-sm font-semibold dark:text-white">Change Date</span>
                                                <span className="block text-sm dark:text-gray-300">Column(DateTime, default=datetime.datetime.utcnow)</span>
                                            </div>
                                            <div className="space-y-1 ">
                                                <span className="block text-sm font-semibold dark:text-white">Status</span>
                                                <span className="block text-sm dark:text-gray-300 w-fit">{renderStatus('PENDING')}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-sm font-semibold dark:text-white">Approved By</span>
                                                <span className="block text-sm dark:text-gray-300">Column(String(60), ForeignKey('users.id'), nullable=True)</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-sm font-semibold dark:text-white">Old Values</span>
                                                <span className="block text-sm dark:text-gray-300">View</span>
                                            </div>
                                        </div>
                                        <div className="gap-2">
                                            <div className="">
                                                <h4 className="font-bold">New Values</h4>
                                            </div>
                                            <div className="panel gap-5 flex flex-col">
                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Name</span>
                                                    <span className="block text-sm dark:text-gray-300">Column(String(100), nullable=False)</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Description</span>
                                                    <span className="block text-sm dark:text-gray-300">Column(String(255), nullable=True)</span>
                                                </div>

                                               
                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Expiry Date</span>
                                                    <span className="block text-sm dark:text-gray-300">Column(Date, nullable=True)</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Date Effective</span>
                                                    <span className="block text-sm dark:text-gray-300">Column(Date, nullable=True)</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Is Signed</span>
                                                    <span className="block text-sm dark:text-gray-300">Column(Boolean, default=False)</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Signed Date</span>
                                                    <span className="block text-sm dark:text-gray-300">Column(Date, nullable=True)</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Status</span>
                                                    <span className="block text-sm dark:text-gray-300">Column(Enum(Status), default=Status.INACTIVE, nullable=False)</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Insurance Package Id</span>
                                                    <span className="block text-sm dark:text-gray-300">
                                                        Column(String(60), ForeignKey('insurance_packages.id', ondelete="SET NULL"), nullable=True)
                                                    </span>
                                                </div>

                                               

                                                <div className="space-y-1">
                                                    <span className="block text-sm font-semibold dark:text-white">Policy Number</span>
                                                    <span className="block text-sm dark:text-gray-300">Column(String(100), nullable=True)</span>
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

export default ViewAmendment;
