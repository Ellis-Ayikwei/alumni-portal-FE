import { faEye, faMoneyBillWave, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import sortBy from 'lodash/sortBy';
import { useContextMenu } from 'mantine-contextmenu';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { downloadExcel } from 'react-export-table-to-excel';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Select, { StylesConfig } from 'react-select';
import useSwr, { mutate } from 'swr';
import 'tippy.js/dist/tippy.css';
import Dropdown from '../../components/Dropdown';
import IconBell from '../../components/Icon/IconBell';
import IconBolt from '../../components/Icon/IconBolt';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconFile from '../../components/Icon/IconFile';
import IconLoader from '../../components/Icon/IconLoader';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconTrash from '../../components/Icon/IconTrash';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconX from '../../components/Icon/IconX';
import axiosInstance from '../../helper/axiosInstance';
import confirmDialog from '../../helper/confirmDialog';
import Ghc from '../../helper/CurrencyFormatter';
import fetcher from '../../helper/fetcher';
import { renderStatus } from '../../helper/renderStatus';
import showMessage from '../../helper/showMessage';
import { IRootState } from '../../store';
import { GetAlumniData } from '../../store/alumnigroupSlice';
import { GetPaymentsData } from '../../store/paymentsSlice';
import { setPageTitle } from '../../store/themeConfigSlice';
import AddPaymentMethod from './paymentUtils/addPaymentMethod';
import MakePayments from './paymentUtils/makePayments';
import handleMultiPaymentCompletion from './paymentUtils/multiPaymentCompletion';
import handleMultiPaymentDeletion from './paymentUtils/multiPaymentDeletion';
import handleMultiPaymentFailure from './paymentUtils/multiPaymentsFailure';

const col = ['name', 'start_date', 'end_date', 'insurance_package', 'is_locked', 'id', 'create_at', 'updated_at'];

const PaymentsMangement = () => {
    const dispatch = useDispatch();
    const [alumnidata, setUsersData] = useState<any>([]);
    const alumniGroups = useSelector((state: IRootState) => state.alumnidata.alumniGroups);
    const allPayments = useSelector((state: IRootState) => state.payments.allPayments);
    const [deleteLoading, setDeletLoadingData] = useState<{ [key: string]: boolean }>({});

    const userDataIsLoading = useSelector((state: IRootState) => state.alumnidata.loading);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const { showContextMenu } = useContextMenu();
    const [addNewMethodModal, setAddNewMethodModal] = useState(false);
    const { data: paymentMethods, error: paymentMethodsError, isLoading: paymentMethodsLoading } = useSwr('/payment_methods', fetcher);
    const [paymentId, setPaymentId] = useState<string>('');
    const [edit, setEdit] = useState<boolean>(false);

    useEffect(() => {
        dispatch(GetPaymentsData() as any);
        console.log('all contracts', allPayments);
    }, [dispatch]);

    useEffect(() => {
        dispatch(setPageTitle('Multiple Tables'));
        dispatch(GetAlumniData() as any);
        console.log('thealumni data', alumniGroups);
    }, [dispatch]);

    useEffect(() => {
        if (allPayments) {
            setInitialRecords(sortBy(allPayments, 'created_at').reverse());
        }
    }, [allPayments]);

    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(allPayments, 'created_at'));
    const [recordsData, setRecordsData] = useState<any[]>(initialRecords);
    const rowData = initialRecords;
    const [search, setSearch] = useState('');

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const [view, setView] = useState(false);

    const totalPayments = Array.isArray(allPayments)
        ? allPayments.reduce((acc, cur) => {
              return acc + cur.amount;
          }, 0)
        : 0;

    const totalCompletedPayments = Array.isArray(allPayments)
        ? allPayments.reduce((acc, cur) => {
              return cur.status === 'COMPLETED' ? acc + cur.amount : acc;
          }, 0)
        : 0;

    const [query, setQuery] = useState('');

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        const filterRecords = (item: any) => {
            const accessors = Object.keys(item) as (keyof typeof item)[];
            return accessors.some((accessor) => {
                const value = item[accessor];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(search.toLowerCase());
                }
                if (typeof value === 'number') {
                    return value.toString().includes(search.toLowerCase());
                }
                if (value instanceof Date) {
                    return dayjs(value).format('DD MMM YYYY').includes(search.toLowerCase());
                }
                if (accessor === 'insurance_package') {
                    return value.name.toLowerCase().includes(search.toLowerCase());
                }
                return false;
            });
        };

        setRecordsData(() => {
            return Object.values(allPayments)?.filter(filterRecords);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortStatus]);

    useEffect(() => {
        dispatch(setPageTitle('Export Table'));
    });

    // const header = ['Id', 'Firstname', 'Lastname', 'Email', 'Adress', 'Start Date', 'Phone', 'Role', 'id', 'Dob', 'azure_id'];
    const capitalize = (text: any) => {
        return text
            .replace('_', ' ')
            .replace('-', ' ')
            .toLowerCase()
            .split(' ')
            .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    };

    const header = Object.keys(recordsData[0] || {})
        .slice(1, -1)
        .map(capitalize);

    const bodyData = recordsData.map((item) => Object.values(item).slice(1, -1));

    function handleDownloadExcel() {
        downloadExcel({
            fileName: 'Alumni Portal User Data',
            sheet: 'User Data',
            tablePayload: { header, body: bodyData as (string | number | boolean)[][] },
        });
    }

    const [showModal, setShowModal] = useState<any>(false);

    const editUser = (user: any = null) => {
        navigate('/userAccountSetting');
    };

    const deletePayment = async (payment_id: any) => {
        try {
            const response = await axiosInstance.delete(`/payments/${payment_id}`);
            if (response.status === 200) {
                showMessage(`payment deleted`);
                dispatch(GetPaymentsData() as any);
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
        }

        showMessage('User has been deleted successfully.');
    };

    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [hideCols, setHideCols] = useState<any>(['id', 'updated_at']);

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        { accessor: 'id', title: 'Payment Id', sortable: true },
        { accessor: 'amount', title: 'Amount', sortable: true },
        { accessor: 'payment_date', title: 'Payment Date', sortable: true },
        { accessor: 'status', title: 'Status', sortable: true },
        { accessor: 'payment_method', title: 'Payment Method', sortable: true },
        { accessor: 'receipt_url', title: 'Receipt Url', sortable: true },
        { accessor: 'group_id', title: 'Group Id', sortable: true },
        { accessor: 'contract_id', title: 'Contract Id', sortable: true },
        { accessor: 'payer_id', title: 'Payer Id', sortable: true },
        { accessor: 'created_at', title: 'Date Created', sortable: true },
        { accessor: 'updated_at', title: 'Last Updated', sortable: true },
    ];
    const handleNavigation = (payload: any) => {
        // You can pass any data here in the state object
        navigate('/profile', { state: payload });
    };

    const OptionStyles: StylesConfig<any, true> = {
        menuList: (provided, state) => ({
            ...provided,
            height: '150px',
            zIndex: 'auto',
        }),
    };

    const handleDeletePm = async (pmId: string) => {
        const confrimed = await confirmDialog({
            title: 'Delete Payment Method',
            finalQuestion: 'Are you sure you want to delete this payment method?',
        });

        if (confrimed) {
            setDeletLoadingData((prvld) => ({ ...prvld, [pmId]: true }));
            try {
                const response = await axiosInstance.delete(`/payment_methods/${pmId}`);
                if (response.status === 200) {
                    showMessage('Payment method has been deleted successfully.', 'success');
                    setDeletLoadingData((prvld) => ({ ...prvld, [pmId]: false }));
                    mutate('/payment_methods');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setDeletLoadingData((prvld) => ({ ...prvld, [pmId]: false }));
            }
        }
    };

    return (
        <div>
            <div className="panel flex items-center overflow-x-auto whitespace-nowrap p-3 text-primary">
                <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3">
                    <IconBell />
                </div>
                <span className="ltr:mr-3 rtl:ml-3">Documentation: </span>
                <a href="https://www.npmjs.com/package/mantine-datatable" target="_blank" className="block hover:underline">
                    https://www.npmjs.com/package/mantine-datatable
                </a>
            </div>

            <div className="panel mt-6">
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Payments</h5>
                </div>
                <div>
                    <div className="grid sm:grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-6 mb-6 justify-between w-full">
                        <div className="grid md:grid-cols-2 sm:grid-cols-1 md:col-span-2 gap-3">
                            <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                                <div className="mb-5">
                                    <span className="bg-[#1b2e4b] text-cyan-300 text-sm rounded-full px-4 py-1.5 before:bg-cyan-500 before:w-1.5 before:h-1.5 before:rounded-full ltr:before:mr-2 rtl:before:ml-2 before:inline-block">
                                        Total Paid
                                    </span>
                                </div>
                                <div className="flex items-center mt-5">
                                    <div className="text-xl sm:text-sm md:text-xl lg:text-2xl xl:text-3xl font-bold ltr:mr-3 rtl:ml-3 flex items-center gap-2">{Ghc(totalCompletedPayments)}</div>
                                </div>
                                <div className="flex items-center font-semibold mt-5">for 5 groups</div>
                            </div>
                            <div className="panel bg-gradient-to-r from-amber-400 to-amber-500">
                                <div className="mb-5">
                                    <span className="bg-[#1b2e4b] text-amber-300 sm:text-xs rounded-full px-4 py-1.5 before:bg-amber-600 before:w-1.5 before:h-1.5 before:rounded-full ltr:before:mr-2 rtl:before:ml-2 before:inline-block">
                                        Total Payments
                                    </span>
                                </div>
                                <div className="flex items-center mt-5">
                                    <div className="text-xl sm:text-sm md:text-xl lg:text-2xl xl:text-3xl font-bold ltr:mr-3 rtl:ml-3 flex items-center gap-2">{Ghc(totalPayments)}</div>
                                </div>
                                <div className="flex items-center font-semibold mt-5">for 5 groups</div>
                            </div>
                        </div>

                        <div className="panel  p-0 border-0  justify-end items-end xl:col-span-1 sm:col-span-2">
                            <div className="p-5">
                                <div className="mb-5">
                                    <span className="bg-[#1b2e4b] text-white text-xs rounded-full px-4 py-1.5 before:bg-white before:w-1.5 before:h-1.5 before:rounded-full ltr:before:mr-2 rtl:before:ml-2 before:inline-block">
                                        Request Payment
                                    </span>
                                </div>
                                <div className="mb-5 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[#515365] font-semibold">Group</p>

                                        <div className="form-control w-[200px]">
                                            <Select
                                                id="status"
                                                options={Array.isArray(alumniGroups) ? alumniGroups.map((alumni: any) => ({ value: alumni.id, label: alumni.name })) : []}
                                                // value={{ value: params?.status, label: params?.status }}
                                                // onChange={(selected: any) => setParams((prev) => ({ ...prev, status: selected.value }))}
                                                // isSearchable={true}
                                                // required
                                                hideSelectedOptions={true}
                                                styles={OptionStyles}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[#515365] font-semibold">Amount</p>
                                        <p className="text-base">
                                            <span>
                                                {' '}
                                                <div className="flex">
                                                    <CurrencyInput
                                                        id="sumAssured"
                                                        name="sumAssured"
                                                        prefix="GH₵ "
                                                        defaultValue={0}
                                                        decimalsLimit={2}
                                                        onValueChange={(value) => handleInputChange('sum_assured', value)}
                                                        className="form-input"
                                                    />
                                                </div>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-center px-2 flex justify-around">
                                    <button type="button" className="btn btn-success">
                                        Ask for Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="flex items-center flex-nowrap">
                        <button type="button" className="btn btn-primary btn-sm m-1 bg-[#4a8dff] hover:bg-[#3883e6]" onClick={handleDownloadExcel}>
                            <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-white" />
                            EXCEL
                        </button>
                    </div>
                    <div className="dropdown">
                        <Dropdown
                            placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                            btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                            button={
                                <>
                                    <span className="ltr:mr-1 rtl:ml-1">Columns</span>
                                    <IconCaretDown className="w-5 h-5" />
                                </>
                            }
                        >
                            <ul className="!min-w-[140px]">
                                {cols.map((col, i) => {
                                    return (
                                        <li
                                            key={i}
                                            className="flex flex-col"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <div className="flex items-center px-4 py-1">
                                                <label className="cursor-pointer mb-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={!hideCols.includes(col.accessor)}
                                                        className="form-checkbox"
                                                        defaultValue={col.accessor}
                                                        onChange={(event: any) => {
                                                            setHideCols(event.target.value);
                                                            showHideColumns(col.accessor, event.target.checked);
                                                        }}
                                                    />
                                                    <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                </label>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Dropdown>
                    </div>

                    <div>
                        <Tippy content="refresh">
                            <button type="button" className="btn btn-dark w-8 h-8 p-0 rounded-full" onClick={() => dispatch(GetPaymentsData() as any)}>
                                <IconRefresh className="w-5 h-5" />
                            </button>
                        </Tippy>
                    </div>
                    <div className={` gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled ${selectedRecords.length > 0 ? '!flex' : 'hidden'}`}>
                        <div>
                            <Tippy content="Delete">
                                <button
                                    type="button"
                                    className="btn bg-red-500 hover:bg-red-600 w-8 h-8 p-0 rounded-xl shadow-md"
                                    onClick={() => handleMultiPaymentDeletion(selectedRecords, dispatch, setSelectedRecords)}
                                >
                                    <IconTrash className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>
                        <div>
                            <Tippy content="Set status as completed">
                                <button
                                    type="button"
                                    onClick={() => handleMultiPaymentCompletion(selectedRecords, dispatch)}
                                    className="btn bg-green-500 hover:bg-green-600 h-8 w-8 px-1 rounded-xl shadow-md"
                                >
                                    <IconBolt className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>
                        <div>
                            <Tippy content="Set status as failed">
                                <button
                                    type="button"
                                    onClick={() => handleMultiPaymentFailure(selectedRecords, dispatch)}
                                    className="btn bg-red-900 hover:bg-green-600 h-8 w-8 px-1 rounded-xl shadow-md"
                                >
                                    <IconX className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>
                    </div>

                    <div className="flex ltr:ml-auto rtl:mr-auto gap-1">
                        <div className="relative">
                            <input type="text" className="form-input w-auto pl-2 pr-12" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            <button type="button" className="absolute inset-y-0 right-0 flex items-center px-2" onClick={() => setSearch('')}>
                                <IconX className="w-5 h-5 text-gray-500 hover:text-gray-900" />
                            </button>
                        </div>
                        <Tippy content="Add A New payment">
                            <button
                                type="button"
                                className="btn btn-success w-8  p-0 "
                                onClick={() => {
                                    setShowModal(true);
                                }}
                            >
                                <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5 text-white" />
                            </button>
                        </Tippy>
                    </div>
                </div>

                <div className="datatables">
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={recordsData}
                        columns={[
                            {
                                accessor: 'id',
                                title: 'Payment Id',
                                sortable: true,
                                hidden: hideCols.includes('id'),
                            },
                            {
                                accessor: 'amount',
                                title: 'Amount',
                                sortable: true,
                                hidden: hideCols.includes('amount'),
                                render: ({ amount }) => {
                                    const _amount = amount as number;
                                    return _amount?.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'GHC',
                                    });
                                },
                            },
                            {
                                accessor: 'payment_date',
                                title: 'Payment Date',
                                sortable: true,
                                hidden: hideCols.includes('payment_date'),
                                render: ({ payment_date }) => {
                                    const _date = payment_date as string | number | Date;

                                    return dayjs(_date).format('DD MMM YYYY');
                                },
                            },
                            {
                                accessor: 'status',
                                title: 'Status',
                                sortable: true,
                                hidden: hideCols.includes('status'),
                                render: ({ status }) => {
                                    const grpStatus = status as string;
                                    return renderStatus(grpStatus);
                                },
                            },
                            {
                                accessor: 'payment_method.name',
                                title: 'Payment Method',
                                sortable: true,
                                hidden: hideCols.includes('payment_method'),
                            },

                            { accessor: 'group.name', title: 'Alumni Group', sortable: true, hidden: hideCols.includes('group_id') },
                            { accessor: 'payer.full_name', title: 'Payer', sortable: true, hidden: hideCols.includes('payer') },
                            {
                                accessor: 'created_at',
                                title: 'Date Created',
                                sortable: true,
                                hidden: hideCols.includes('created_at'),
                                render: ({ created_at }) => {
                                    const _date = created_at as string | number | Date;

                                    return dayjs(_date).format('DD MMM, YYYY - hh:mm A');
                                },
                            },
                            {
                                accessor: 'updated_at',
                                title: 'Last Updated',
                                sortable: true,
                                hidden: hideCols.includes('updated_at'),
                                render: ({ updated_at }) => {
                                    const _date = updated_at as string | number | Date;

                                    return dayjs(_date).format('DD MMM, YYYY - hh:mm A');
                                },
                            },
                            {
                                accessor: '',
                                title: 'Attachments',
                                sortable: true,
                                hidden: hideCols.includes('updated_at'),
                                render: ({ attachments }) => {
                                    const _attachments = attachments as any[];
                                    return _attachments.length || 0;
                                },
                            },
                            {
                                accessor: '',
                                title: 'Actions',
                                sortable: true,
                                hidden: hideCols.includes('Actions'),
                                render: (item: any) => {
                                    function handleEditPayment(item: any): void {
                                        setShowModal(true);
                                        setPaymentId(item.id);
                                        setEdit(true);

                                        // navigate(`/edit-payment/${item.id}`, { state: { payment: item } });
                                    }
                                    function handleViewPayment(item: any): void {
                                        setShowModal(true);
                                        setPaymentId(item.id);
                                        setView(true);

                                        // navigate(`/edit-payment/${item.id}`, { state: { payment: item } });
                                    }
                                    return (
                                        <div className="flex items-center gap-2">
                                            <Tippy content="View">
                                                <button type="button" className="btn btn-outline-info rounded-full px-2  text-xs " onClick={() => handleViewPayment(item)}>
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                            </Tippy>
                                            <Tippy content="Edit">
                                                <button type="button" className="btn btn-outline-success rounded-full px-2  text-xs " onClick={() => handleEditPayment(item)}>
                                                    <FontAwesomeIcon icon={faPen} />
                                                </button>
                                            </Tippy>
                                            <Tippy content="Delete">
                                                <button type="button" className="btn btn-outline-danger rounded-full px-2 text-xs" onClick={() => deletePayment(item.id)}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </Tippy>
                                        </div>
                                    );
                                },
                            },
                        ]}
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={setSelectedRecords}
                        striped={true}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>

            <div className="panel mt-5">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Payment Methods</h5>
                    <button type="button" className="btn btn-success" onClick={() => setAddNewMethodModal(true)}>
                        Add New Payments Method
                    </button>
                </div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th className="ltr:rounded-l-md rtl:rounded-r-md">Payment Method</th>
                                <th className="ltr:rounded-r-md rtl:rounded-l-md">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentMethods
                                ? paymentMethods.map((pm: any) => (
                                      <tr key={pm.id} className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                          <td className="min-w-[150px] text-black dark:text-white">
                                              <div className="flex items-center">
                                                  <span className="whitespace-nowrap">{pm.name}</span>
                                              </div>
                                          </td>
                                          <td className="flex gap-2">
                                              <Tippy content="View Details">
                                                  <button type="button" onClick={() => handleDeletePm(pm?.id)}>
                                                      {deleteLoading[pm?.id] ? <IconLoader className="animate-spin inline-block" /> : <IconTrashLines className="m-auto" />}
                                                  </button>
                                              </Tippy>
                                          </td>
                                      </tr>
                                  ))
                                : []}
                        </tbody>
                    </table>
                </div>
            </div>
            {showModal && (
                <MakePayments showModal={showModal} setShowModal={setShowModal} edit={edit} setEdit={setEdit} view={view} setView={setView} paymentId={paymentId} setPaymentId={setPaymentId} />
            )}
            {addNewMethodModal && <AddPaymentMethod showModal={addNewMethodModal} setShowModal={setAddNewMethodModal} />}
        </div>
    );
};

export default PaymentsMangement;
