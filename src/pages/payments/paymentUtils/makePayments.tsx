import { Dialog, Transition } from '@headlessui/react';
import dayjs from 'dayjs';
import isEqual from 'lodash/isEqual';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import useSwr, { mutate } from 'swr';
import IconDownload from '../../../components/Icon/IconDownload';
import IconFile from '../../../components/Icon/IconFile';
import IconLoader from '../../../components/Icon/IconLoader';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconX from '../../../components/Icon/IconX';
import axiosInstance, { apiUrl } from '../../../helper/axiosInstance';
import ConfirmDialog from '../../../helper/confirmDialog';
import DropzoneComponent from '../../../helper/dropZoneComponent';
import fetcher from '../../../helper/fetcher';
import { IRootState } from '../../../store';
import { GetAlumniData } from '../../../store/alumnigroupSlice';
import { GetPaymentsData } from '../../../store/paymentsSlice';
import { GetUsersData } from '../../../store/usersSlice';
import AddPaymentMethod from './addPaymentMethod';
import showMessage from './showMessage';

interface MakePaymentsProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    edit?: boolean;
    view?: boolean;
    setView?: (value: boolean) => void;
    paymentId?: string;
    setPaymentId?: (value: string) => void;
    setEdit?: (value: boolean) => void;
}

const MakePayments = ({ showModal, setShowModal, edit, setEdit, view, setView, paymentId, setPaymentId }: MakePaymentsProps) => {
    const dispatch = useDispatch();
    const { getRootProps, getInputProps } = useDropzone();

    useEffect(() => {
        dispatch(GetAlumniData() as any);
        dispatch(GetUsersData() as any);
    }, [dispatch]);

    const [amount, setAmount] = useState<number>(0);
    const [selectedGroupOption, setSelectedGroupOption] = useState<any>();
    const groups = useSelector((state: IRootState) => state.alumnidata.alumniGroups);
    const { data: groupsMembers, error: groupsMembersError } = useSwr(selectedGroupOption ? `/alumni_groups/${selectedGroupOption?.value}/members` : null, fetcher);
    const users = useSelector((state: IRootState) => state.usersdata.usersData);
    const [files, setFiles] = useState<FileUpload[]>([]);

    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [addNewMethodModal, setAddNewMethodModal] = useState(false);
    const { data: paymentMethods, error: paymentMethodsError, isLoading: paymentMethodsLoading } = useSwr('/payment_methods', fetcher);
    const [params, setParams] = useState<any>({});

    const { data, error } = useSwr(edit || view ? `/payments/${paymentId}` : null, fetcher);

    useEffect(() => {
        if (data) {
            console.log('data', data);
            setParams({ ...data, payment_date: dayjs(data.payment_date).format('YYYY-MM-DD') });
            console.log('params', { ...data });
        }
        return () => {
            setParams({});
        };
    }, [data, edit, view]);
    const savePayment = async () => {
        setIsSaveLoading(true);

        const payload = {
            ...params,
            ...files,
        };
        console.log(' the payload', payload);

        try {
            const response = !edit
                ? await axiosInstance.post('/payments', payload, {
                      headers: {
                          'Content-Type': 'multipart/form-data',
                      },
                  })
                : await axiosInstance.put(`/payments/${paymentId}`, payload, {
                      headers: {
                          'Content-Type': 'multipart/form-data',
                      },
                  });
            if (response.status === 201 || response.status === 200) {
                showMessage(`Payment has been ${edit ? 'updated' : 'created'} successfully.`, 'success');
                dispatch(GetPaymentsData() as any);
                mutate(`/payments/${paymentId}`);
                setShowModal(false);
            }
        } catch (error: any) {
            showMessage('An error occurred while creating payment.', 'error');
            console.error('Error:', error);
        } finally {
            setIsSaveLoading(false);
        }
    };

    type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    const handleChange = (e: InputChangeEvent | React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setParams({ ...params, [id]: value });
    };

    interface FileUpload {
        name: string;
        size: number;
        type: string;
    }

    const handleFileUpload = (files: FileUpload[]) => {
        setFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const reset = () => {
        setShowModal(false), setEdit && setEdit(false), setView && setView(false), setPaymentId && setPaymentId(''), setParams && setParams({});
    };

    useEffect(() => {}, [edit, view]);

    const [deactivateSave, setDeactivateSave] = useState(false);
    const prevObjectRef = useRef({ ...data });
    const memoizedObject = useMemo(() => {
        if (!isEqual(prevObjectRef.current, params)) {
            prevObjectRef.current = params;
        }
        return prevObjectRef.current;
    }, [params]);

    useEffect(() => {
        if (isEqual(memoizedObject, data)) {
            setDeactivateSave(true);
        } else {
            setDeactivateSave(false);
        }
        console.log('Object deeply changed');
        console.log('is the value the same?', isEqual(memoizedObject, data));
    }, [memoizedObject]);

    console.log('files', data?.attachments);

    const handleDeleteAttachment = async (id: string, filename: string) => {
        try {
            const confirm = await ConfirmDialog({
                title: 'Delete Attachment',
                note: 'this action cannot be undone',
                finalQuestion: 'Are you sure you want to delete this attachment?',
            });
            if (confirm) {
                const response = await axiosInstance.delete(`/uploads/${id}/${filename}`);
                if (response.status === 200) {
                    mutate(`/payments/${paymentId}`);
                    showMessage('Attachment has been deleted successfully.', 'success');
                }
            }
        } catch {}
    };

    useEffect(() => {
        if (groupsMembers) {
            console.log('groupsMembers.................', groupsMembers);
        }
    }, [selectedGroupOption]);

    return (
        <Transition appear show={showModal} as={Fragment}>
            <Dialog
                as="div"
                open={showModal}
                onClose={() => {
                    reset();
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
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-y-scroll w-full max-w-lg text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setParams({});
                                        setEdit && setEdit(false);
                                        setPaymentId && setPaymentId('');
                                    }}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    {edit ? 'Edit Payment' : view ? 'View Payment' : 'Add New Payment'}
                                </div>
                                <div className="p-5">
                                    <form className="space-y-6">
                                        <div>
                                            <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Group
                                            </label>
                                            <div className="mt-1">
                                                <Select
                                                    id="group_id"
                                                    classNamePrefix="select"
                                                    isSearchable={true}
                                                    isClearable={false}
                                                    onChange={(option: any) => {
                                                        setSelectedGroupOption(option);
                                                        handleChange({ target: { id: 'group_id', value: option.value } } as InputChangeEvent);
                                                    }}
                                                    defaultValue={data?.group_id ? { value: data?.group?.id, label: data?.group?.name } : ' '}
                                                    options={Object.values(groups)?.map((group) => ({
                                                        value: group.id,
                                                        label: group.name,
                                                    }))}
                                                    isDisabled={view}
                                                />
                                            </div>
                                        </div>
                                        {selectedGroupOption && (
                                            <div>
                                                <label htmlFor="payedBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Payed by
                                                </label>
                                                <div className="mt-1">
                                                    <Select
                                                        id="payer_id"
                                                        classNamePrefix="select"
                                                        isSearchable={true}
                                                        isClearable={false}
                                                        onChange={(option: any) => handleChange({ target: { id: 'payer_id', value: option.value } } as InputChangeEvent)}
                                                        defaultValue={data?.payer_id ? { value: data?.payer?.id, label: data?.payer?.full_name } : ' '}
                                                        options={groupsMembers ? Object.values(groupsMembers)?.map((user: any) => ({
                                                            value: user?.user_info?.id,
                                                            label: user?.user_info?.full_name,
                                                        })) : []}
                                                        isDisabled={view}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Amount
                                            </label>
                                            <div className="mt-1">
                                                <CurrencyInput
                                                    id="amount"
                                                    name="amount"
                                                    prefix="GH₵ "
                                                    value={params?.amount || 0}
                                                    defaultValue={0}
                                                    decimalsLimit={2}
                                                    onValueChange={(value) => handleChange({ target: { id: 'amount', value: value || '' } } as InputChangeEvent)}
                                                    className="form-input"
                                                    readOnly={view}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Payment Date
                                            </label>
                                            <div className="mt-1">
                                                <input id="payment_date" type="date" value={params?.payment_date || ''} onChange={(e) => handleChange(e)} className="form-input" readOnly={view} />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Status
                                            </label>
                                            <div className="mt-1">
                                                <Select
                                                    id="status"
                                                    classNamePrefix="select"
                                                    isSearchable={false}
                                                    isClearable={false}
                                                    onChange={(newValue) => handleChange({ target: { id: 'status', value: typeof newValue === 'string' ? newValue : newValue?.value || '' } } as InputChangeEvent)}
                                                    defaultValue={data?.status ? { value: data?.status, label: data?.status } : ' '}
                                                    options={[
                                                        { value: 'PENDING', label: 'Pending' },
                                                        { value: 'COMPLETED', label: 'completed' },
                                                        { value: 'FAILED', label: 'Failed' },
                                                    ]}
                                                    isDisabled={view}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Payment Method
                                            </label>
                                            <div className="mt-1">
                                                <Select
                                                    id="payment_method_id"
                                                    classNamePrefix="select"
                                                    isSearchable={true}
                                                    isClearable={false}
                                                    onChange={(option: any) => handleChange({ target: { id: 'payment_method_id', value: option.value } } as InputChangeEvent)}
                                                    defaultValue={data?.payment_method_id ? { value: data?.payment_method?.id, label: data?.payment_method?.name } : ' '}
                                                    options={
                                                        paymentMethods
                                                            ? Object.values(paymentMethods)?.map((pm: any) => ({
                                                                  value: pm?.id,
                                                                  label: pm?.name,
                                                              }))
                                                            : []
                                                    }
                                                    isDisabled={view}
                                                />
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Payment method not in list ?
                                                <button
                                                    type="button"
                                                    onClick={() => setAddNewMethodModal(true)}
                                                    className="ml-2 text-sm text-gray-500 underline rtl:ml-auto ltr:mr-auto"
                                                    disabled={view}
                                                >
                                                    add new payment method
                                                </button>
                                            </div>
                                            {!view && (
                                                <div className="mt-5">
                                                    <DropzoneComponent onFileUpload={handleFileUpload} />
                                                </div>
                                            )}
                                            <div className="mt-5 space-y-3">
                                                {data?.attachments?.length > 0 && (
                                                    <div className="bg-white rounded-lg shadow p-4 relative">
                                                        <h5 className="font-semibold text-lg">Attachments</h5>
                                                        <div className="grid grid-cols-3 gap-4 mt-2">
                                                            {data?.attachments.map((attachment: any, index: number) => {
                                                                let attachmentContent;
                                                                if (
                                                                    attachment?.url?.endsWith('.png') ||
                                                                    attachment?.url?.endsWith('.jpg') ||
                                                                    attachment?.url?.endsWith('.jpeg') ||
                                                                    attachment?.url?.endsWith('.gif') ||
                                                                    attachment?.url?.toLowerCase().includes('image')
                                                                ) {
                                                                    attachmentContent = (
                                                                        <img
                                                                            src={`${apiUrl}/uploads/${attachment?.url}`}
                                                                            title={attachment?.name}
                                                                            alt={attachment?.name}
                                                                            className="w-full h-48 border"
                                                                        />
                                                                    );
                                                                } else {
                                                                    attachmentContent = (
                                                                        <div className="flex items-center justify-center w-full h-48 border">
                                                                            <IconFile className="w-20 h-20" />
                                                                        </div>
                                                                    );
                                                                }
                                                                return (
                                                                    <div key={index} className="flex flex-col items-center relative">
                                                                        <div className="absolute top-2 right-2 flex justify-center items-center gap-1 ">
                                                                            <a
                                                                                type="button"
                                                                                href={`${apiUrl}/download/${attachment?.url}`}
                                                                                download
                                                                                className="underline text-sm btn-success p-1 rounded-full"
                                                                            >
                                                                                <IconDownload className="w-5 h-5" />
                                                                            </a>
                                                                            {edit && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn-danger hover:text-red-700 mt-1 p-1 rounded-full"
                                                                                    onClick={() => handleDeleteAttachment(attachment?.id, attachment?.url)}
                                                                                    disabled={view}
                                                                                >
                                                                                    <IconTrashLines className="w-5 h-5" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        {/* <a
                                                                            href={`${apiUrl}/uploads/${attachment?.url}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="underline text-sm"
                                                                        >
                                                                            view
                                                                        </a>
                                                                        <a
                                                                            href={`${apiUrl}/uploads/${attachment?.url}`}
                                                                            download
                                                                            className="underline text-sm"
                                                                        >
                                                                            download
                                                                        </a> */}
                                                                        {attachmentContent}
                                                                        <span className="text-sm mt-2 break-all">{attachment?.url}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                    <div className="mt-8 flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() => {
                                                reset();
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        {view && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-success"
                                                onClick={() => {
                                                    setEdit && setEdit(true);
                                                    setView && setView(false);
                                                }}
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button type="button" onClick={() => savePayment()} className="btn btn-success" disabled={isSaveLoading}>
                                            {!isSaveLoading ? edit ? 'Update' : 'Save' : <IconLoader className="animate-spin inline-block" />}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                    {addNewMethodModal && <AddPaymentMethod showModal={addNewMethodModal} setShowModal={setAddNewMethodModal} />}
                </div>
            </Dialog>
        </Transition>
    );
};

export default MakePayments;
