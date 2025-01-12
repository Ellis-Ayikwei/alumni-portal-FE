import { Dialog, Transition } from '@headlessui/react';
import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import Papa from 'papaparse';
import { Fragment, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import useSwr from 'swr';
import IconLoader from '../../../../components/Icon/IconLoader';
import IconTrashLines from '../../../../components/Icon/IconTrashLines';
import IconX from '../../../../components/Icon/IconX';
import axiosInstance from '../../../../helper/axiosInstance';
import ConfirmDialog from '../../../../helper/confirmDialog';
import DropzoneComponent from '../../../../helper/dropZoneComponent';
import fetcher from '../../../../helper/fetcher';
import showMessage from '../../../../helper/showMessage';
import { GetAlumniData } from '../../../../store/alumnigroupSlice';
import { GetUsersData } from '../../../../store/usersSlice';

interface AddUserFromCsvProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;

    groups: any;
}

const AddUserFromCsvFile = ({ showModal, setShowModal, groups }: AddUserFromCsvProps) => {
    const dispatch = useDispatch();
    const { getRootProps, getInputProps } = useDropzone();

    useEffect(() => {
        dispatch(GetAlumniData() as any);
        dispatch(GetUsersData() as any);
    }, [dispatch]);

    const [amount, setAmount] = useState<number>(0);
    // const groups = useSelector((state: IRootState) => state.alumnidata.alumniGroups);
    const [files, setFiles] = useState<File[]>([]);

    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [receiptUrl, setReceiptUrl] = useState<string>('');
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [addNewMethodModal, setAddNewMethodModal] = useState(false);
    const [paymentAttachments, setPaymentAttachments] = useState<any[]>([]);
    const [defaultPassword, setDefaultPassword] = useState<string>('');
    const { data: paymentMethods, error: paymentMethodsError, isLoading: paymentMethodsLoading } = useSwr('/payment_methods', fetcher);
    const [params, setParams] = useState<any>({});
    const [importedUsers, setImportedUsers] = useState<any[]>({});

    useEffect(() => {
        console.log('parsing file');
        if (files.length > 0) {
            // parseCsv(files[0]);
            const somefi = files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const csvData = event.target?.result;
                console.log(JSON.stringify(csvData));
                if (typeof csvData === 'string') {
                    const new_parser = Papa.parse(csvData, {
                        header: true,
                        skipEmptyLines: true,
                        delimiter: ',',
                    });
                    setImportedUsers(new_parser.data);
                }
            };
            reader.readAsText(somefi);
        }

        return () => {
            setImportedUsers([]);
        };
    }, [files]);
    console.log(' the payload');

    const requiredFields = [
        { field: 'first_name', message: 'First Name is required.' },
        { field: 'email', message: 'Email is required.' },
        { field: 'phone', message: 'Phone is required.' },
        // { field: 'username', message: 'Username is required.' },
        { field: 'password', message: 'Password is required.' },
        { field: 'dob', message: 'Date of Birth is required.' },
        { field: 'occupation', message: 'Occupation is required.' },
    ];

    const saveNewUser = async (userData: { [key: string]: any }) => {
        for (const { field, message } of requiredFields) {
            if (!userData[field]) {
                showMessage(message, 'error');
                return false;
            }
        }

        const payload = JSON.stringify(userData);

        try {
            const response = await axiosInstance.post('/users', payload);
            if (response.status === 201) {
                await Promise.all(
                    groups.map(async (group: any) => {
                        await axiosInstance.post(`/alumni_groups/${group.id}/members`, { user_id: response.data.id });
                    })
                );

                showMessage('User created successfully.', 'success');

                dispatch(GetUsersData() as any);
                return true;
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                const parser = new DOMParser();
                const errorData = error.response.data;
                const doc = parser.parseFromString(errorData, 'text/html');
                const errorMess = doc.querySelector('body')?.innerText || 'An error occurred';
                const errorMessage = errorMess.split('\n')[1];
                console.error('Error:', errorMessage);
                showMessage(errorMessage, 'error');
            }
        }
        return false;
    };

    const handleAddNewUsers = async () => {
        setIsSaveLoading(true);

        if (defaultPassword) {
            for (const user of importedUsers) {
                await saveNewUser({ ...user, password: defaultPassword, username: user.email, dob: dayjs(user.dob).format('YYYY-MM-DD') });
            }
            setIsSaveLoading(false);
            setShowModal(false);
        } else {
            showMessage('Default password is required', 'error');
            setIsSaveLoading(false);
        }

        setIsSaveLoading(false);
    };

    type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    const handleChange = (e: InputChangeEvent | React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setParams({ ...params, [id]: value });
    };

    const handleFileUpload = (files: any) => {
        setFiles((prevFiles: File[]) => [...prevFiles, ...files]);
    };

    const reset = () => {
        setShowModal(false), setGroupId && setGroupId(''), setParams && setParams({});
    };

    const deleteImportedUser = (index: number) => {
        const newImportedUsers = [...importedUsers];
        newImportedUsers.splice(index, 1);
        setImportedUsers(newImportedUsers);
    };

    // const [deactivateSave, setDeactivateSave] = useState(false);
    // const prevObjectRef = useRef({ ...data });
    // const memoizedObject = useMemo(() => {
    //     if (!isEqual(prevObjectRef.current, params)) {
    //         prevObjectRef.current = params;
    //     }
    //     return prevObjectRef.current;
    // }, [params]);

    // useEffect(() => {
    //     if (isEqual(memoizedObject, data)) {
    //         setDeactivateSave(true);
    //     } else {
    //         setDeactivateSave(false);
    //     }
    //     console.log('Object deeply changed');
    //     console.log('is the value the same?', isEqual(memoizedObject, data));
    // }, [memoizedObject]);

    // console.log('files', data?.attachments);

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
                    // mutate(`/group/${paymentId}`);
                    showMessage('Attachment has been deleted successfully.', 'success');
                }
            }
        } catch {}
    };

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
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-y-scroll w-full max-w-full h-full-auto text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setParams({});
                                    }}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Add Users FRom a Csv File</div>
                                <div className="p-5">
                                    <form className="space-y-6">
                                        <div>
                                            <label htmlFor="upload file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Upload File
                                            </label>

                                            <div className="mt-5">
                                                <DropzoneComponent onFileUpload={handleFileUpload} />
                                            </div>
                                        </div>
                                    </form>
                                    {importedUsers.length > 0 && (
                                        <div className="grid xl:grid-cols-1 sm:grid-cols-1 gap-4">
                                            <div className="panel h-full w-full">
                                                <div className="flex items-center justify-between mb-5">
                                                    <h5 className="font-semibold text-lg dark:text-white-light">New Members</h5>
                                                    <div className="flex items-center">
                                                        <label htmlFor="Default_login_password" className="text-l font-medium text-gray-700 dark:text-gray-300">
                                                            Default Login Password for users:
                                                        </label>
                                                        <input
                                                            type="text"
                                                            onChange={(e) => setDefaultPassword(e.target.value)}
                                                            className="rounded-md !border-black border-2 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 py-1 ml-2"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="table-responsive">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th className="ltr:rounded-l-md rtl:rounded-r-md">First Name</th>
                                                                <th>Last Name</th>
                                                                <th>Other Names</th>
                                                                <th>Email</th>
                                                                <th>Phone Number</th>
                                                                <th>Gender</th>
                                                                <th>Dob</th>
                                                                <th>Occupation</th>
                                                                <th>Address</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {importedUsers &&
                                                                Array.isArray(importedUsers) &&
                                                                importedUsers.map((user: any, index: number) => (
                                                                    <tr className="text-white-dark hover:text-black dark:hover:text-white-light/90 group" key={index}>
                                                                        <td className="min-w-[150px] text-black dark:text-white">{user.first_name}</td>
                                                                        <td>{user.last_name}</td>
                                                                        <td>{user.other_names}</td>
                                                                        <td>{user.email}</td>
                                                                        <td>{user.phone}</td>
                                                                        <td>{user.gender}</td>
                                                                        <td>{user.dob}</td>
                                                                        <td>{user.occupation}</td>
                                                                        <td>{user.address}</td>
                                                                        <td>
                                                                            <Tippy content="remove from list">
                                                                                <button
                                                                                    type="button"
                                                                                    className="text-danger font-semibold hover:underline group"
                                                                                    onClick={() => deleteImportedUser(index)}
                                                                                >
                                                                                    <IconTrashLines className="ltr:ml-1 rtl:mr-1 inline-block relative transition-all duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180" />
                                                                                </button>
                                                                            </Tippy>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                        {/* {view && (
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
                                        )} */}
                                        <button type="button" onClick={() => handleAddNewUsers()} className="btn btn-success" disabled={isSaveLoading}>
                                            {!isSaveLoading ? 'Save' : <IconLoader className="animate-spin inline-block" />}
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

export default AddUserFromCsvFile;
