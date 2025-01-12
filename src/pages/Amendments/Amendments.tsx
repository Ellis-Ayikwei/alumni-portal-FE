import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import sortBy from 'lodash/sortBy';
import { useContextMenu } from 'mantine-contextmenu';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { downloadExcel } from 'react-export-table-to-excel';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import 'tippy.js/dist/tippy.css';
import Dropdown from '../../components/Dropdown';
import IconBell from '../../components/Icon/IconBell';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconChecks from '../../components/Icon/IconChecks';
import IconEye from '../../components/Icon/IconEye';
import IconFile from '../../components/Icon/IconFile';
import IconPencil from '../../components/Icon/IconPencil';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconTrash from '../../components/Icon/IconTrash';
import IconX from '../../components/Icon/IconX';
import { renderStatus } from '../../helper/renderStatus';
import showMessage from '../../helper/showMessage';
import { IRootState } from '../../store';
import { GetAmendments } from '../../store/amendmentsSlice';
import { setPageTitle } from '../../store/themeConfigSlice';
import ChangeLog from './AmendmentUtils/changeLogModal';
import handleMultiAmendmentApproval from './AmendmentUtils/multiAmendmentApproval';
import handleMultiAmendmentDelete from './AmendmentUtils/multiAmendmentDelete';
import handleMultiAmendmnetDisable from './AmendmentUtils/multiAmendmentsDisable';

const col = ['name', 'start_date', 'end_date', 'insurance_package', 'is_locked', 'id', 'create_at', 'updated_at'];

const Amendments = () => {
    const dispatch = useDispatch();
    const [alumnidata, setUsersData] = useState<any>([]);
    const userDataIsLoading = useSelector((state: IRootState) => state.alumnidata.loading);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const { showContextMenu } = useContextMenu();
    const { amendments, amendmentsloading, amendmentserror } = useSelector((state: IRootState) => state.amendments) || { amendments: [] };
    const [showChangeLogModal, setShowChangeLogModal] = useState<boolean>(false);
    const [changelog, setChangeLog] = useState<{ newValues: any; oldValues: any }>({ newValues: null, oldValues: null });

    useEffect(() => {
        dispatch(setPageTitle('Multiple Tables'));
        dispatch(GetAmendments() as any);
        console.log('get all amendments', amendments);
    }, [dispatch]);

    useEffect(() => {
        if (amendments) {
            setInitialRecords(sortBy(amendments, 'created_at').reverse());
        }
    }, [amendments]);

    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(amendments, 'name'));
    const [recordsData, setRecordsData] = useState<any[]>(initialRecords);
    const rowData = initialRecords;
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const [query, setQuery] = useState('');

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    // useEffect(() => {
    //     const filterRecords = (item: any) => {
    //         const accessors = Object.keys(item) as (keyof typeof item)[];
    //         console.log('using this accessors', accessors);
    //         return accessors?.some((accessor) => {
    //             const value = item[accessor];
    //             if (typeof value === 'string') {
    //                 return value.toLowerCase().includes(search.toLowerCase());
    //             }
    //             if (typeof value === 'number') {
    //                 return value.toString().includes(search.toLowerCase());
    //             }
    //             if (value instanceof Date) {
    //                 return dayjs(value).format('DD MMM YYYY').includes(search.toLowerCase());
    //             }
    //             if (accessor === 'insurance_package') {
    //                 return value.name.toLowerCase().includes(search.toLowerCase());
    //             }
    //             return false;
    //         });
    //     };

    //     setRecordsData(() => {
    //         return Object.values(amendments)?.filter(filterRecords);
    //     });

    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [search]);

    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortStatus]);

   

    useEffect(() => {
        dispatch(setPageTitle('Export Table'));
    });

    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

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

    const exportTable = (type: any) => {
        let columns: any = col;
        let records = rowData;
        let filename = 'table';

        let newVariable: any;
        newVariable = window.navigator;

        if (type === 'csv') {
            let coldelimiter = ';';
            let linedelimiter = '\n';
            let result = columns
                .map((d: any) => {
                    return capitalize(d);
                })
                .join(coldelimiter);
            result += linedelimiter;
            // eslint-disable-next-line array-callback-return
            records.map((item: any) => {
                // eslint-disable-next-line array-callback-return
                columns.map((d: any, index: any) => {
                    if (index > 0) {
                        result += coldelimiter;
                    }
                    let val = item[d] ? item[d] : '';
                    result += val;
                });
                result += linedelimiter;
            });

            if (result == null) return;
            if (!result.match(/^data:text\/csv/i) && !newVariable.msSaveOrOpenBlob) {
                var data = 'data:application/csv;charset=utf-8,' + encodeURIComponent(result);
                var link = document.createElement('a');
                link.setAttribute('href', data);
                link.setAttribute('download', filename + '.csv');
                link.click();
            } else {
                var blob = new Blob([result]);
                if (newVariable.msSaveOrOpenBlob) {
                    newVariable.msSaveBlob(blob, filename + '.csv');
                }
            }
        } else if (type === 'print') {
            var rowhtml = '<p>' + filename + '</p>';
            rowhtml +=
                '<table style="width: 100%; " cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; "> ';
            // eslint-disable-next-line array-callback-return
            columns.map((d: any) => {
                rowhtml += '<th>' + capitalize(d) + '</th>';
            });
            rowhtml += '</tr></thead>';
            rowhtml += '<tbody>';

            // eslint-disable-next-line array-callback-return
            records.map((item: any) => {
                rowhtml += '<tr>';
                // eslint-disable-next-line array-callback-return
                columns.map((d: any) => {
                    let val = item[d] ? item[d] : '';
                    rowhtml += '<td>' + val + '</td>';
                });
                rowhtml += '</tr>';
            });
            rowhtml +=
                '<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:18px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; border-spacing: 0; }th,td{font-size:12px;text-align:left;padding: 4px;}th{padding:8px 4px;}tr:nth-child(2n-1){background:#f7f7f7; }</style>';
            rowhtml += '</tbody></table>';
            var winPrint: any = window.open('', '', 'left=0,top=0,width=1000,height=600,toolbar=0,scrollbars=0,status=0');
            winPrint.document.write('<title>Print</title>' + rowhtml);
            winPrint.document.close();
            winPrint.focus();
            winPrint.print();
        } else if (type === 'txt') {
            let coldelimiter = ',';
            let linedelimiter = '\n';
            let result = columns
                .map((d: any) => {
                    return capitalize(d);
                })
                .join(coldelimiter);
            result += linedelimiter;
            // eslint-disable-next-line array-callback-return
            records.map((item: any) => {
                // eslint-disable-next-line array-callback-return
                columns.map((d: any, index: any) => {
                    if (index > 0) {
                        result += coldelimiter;
                    }
                    let val = item[d] ? item[d] : '';
                    result += val;
                });
                result += linedelimiter;
            });

            if (result == null) return;
            if (!result.match(/^data:text\/txt/i) && !newVariable.msSaveOrOpenBlob) {
                var data1 = 'data:application/txt;charset=utf-8,' + encodeURIComponent(result);
                var link1 = document.createElement('a');
                link1.setAttribute('href', data1);
                link1.setAttribute('download', filename + '.txt');
                link1.click();
            } else {
                var blob1 = new Blob([result]);
                if (newVariable.msSaveOrOpenBlob) {
                    newVariable.msSaveBlob(blob1, filename + '.txt');
                }
            }
        }
    };

    const [showModal, setShowModal] = useState<any>(false);

    const editUser = (user: any = null) => {
        navigate('/userAccountSetting');
    };

    const deleteUser = (user: any = null) => {
        showMessage('User has been deleted successfully.');
    };

    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [hideCols, setHideCols] = useState<any>(['id']);

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        { accessor: 'name', title: 'Name', sortable: true },
        { accessor: 'start_date', title: 'Start Date', sortable: true },
        { accessor: 'end_date', title: 'End Date', sortable: true },
        { accessor: 'insurance_package', title: 'Insurance Package', sortable: true },
        { accessor: 'is_locked', title: 'Is Locked', sortable: true },
        { accessor: 'id', title: 'Id', sortable: true },
        { accessor: 'create_at', title: 'Create At', sortable: true },
        { accessor: 'updated_at', title: 'Updated At', sortable: true },
    ];
    const handleNavigation = (payload: any) => {
        navigate('/profile', { state: payload });
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Amendments</h5>
                </div>
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="flex items-center flex-nowrap">
                        <button type="button" onClick={() => exportTable('csv')} className="btn btn-primary btn-sm m-1 bg-[#38a169] hover:bg-[#2f855a]">
                            <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-white" />
                            CSV
                        </button>
                        <button type="button" className="btn btn-primary btn-sm m-1 bg-[#4a8dff] hover:bg-[#3883e6]" onClick={handleDownloadExcel}>
                            <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-white" />
                            EXCEL
                        </button>
                        <button type="button" onClick={() => exportTable('print')} className="btn btn-primary btn-sm m-1 bg-[#f6ad55] hover:bg-[#e68b3a]">
                            <IconPrinter className="ltr:mr-2 rtl:ml-2 text-white" />
                            PRINT
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
                            <button type="button" className="btn btn-dark w-8 h-8 p-0 rounded-full" onClick={() => dispatch(GetAmendments() as any)}>
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
                                    onClick={() => handleMultiAmendmentDelete(selectedRecords, dispatch, setSelectedRecords)}
                                >
                                    <IconTrash className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>
                        <div>
                            <Tippy content="Activate">
                                <button
                                    type="button"
                                    onClick={() => handleMultiAmendmentApproval(selectedRecords, dispatch)}
                                    className="btn bg-green-500 hover:bg-green-600 h-8 w-8 px-1 rounded-xl shadow-md"
                                >
                                    <IconChecks className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>
                        <div>
                            <Tippy content="Disapprove">
                                <button
                                    type="button"
                                    onClick={() => handleMultiAmendmnetDisable(selectedRecords, dispatch)}
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
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={recordsData}
                        columns={[
                            {
                                accessor: 'name',
                                title: 'Name',
                                sortable: true,
                                hidden: hideCols.includes('name'),
                            },

                            {
                                accessor: 'status',
                                title: 'Status',
                                sortable: true,
                                hidden: hideCols.includes('Active'),
                                render: ({ status }) => {
                                    const grpStatus = status as string;
                                    return renderStatus(grpStatus);
                                },
                            },
                            {
                                accessor: 'amended_by.full_name',
                                title: 'Amender',
                                sortable: true,
                                hidden: hideCols.includes('amender_user_id'),
                            },
                            {
                                accessor: 'approved_by.full_name',
                                title: 'Approved By',
                                sortable: true,
                                hidden: hideCols.includes('approved_by'),
                            },
                            { accessor: 'approval_date', title: 'Date Approved', sortable: true, hidden: hideCols.includes('updated_at') },

                            {
                                accessor: '',
                                title: 'Change Log',
                                sortable: true,
                                hidden: hideCols.includes('approved_by'),
                                render: ({ new_values, old_values }) => {
                                    return (
                                        <button
                                            className="underline underline-offset-2"
                                            onClick={() => {
                                                setChangeLog({ newValues: new_values, oldValues: old_values });
                                                setShowChangeLogModal(true);
                                            }}
                                        >
                                            View
                                        </button>
                                    );
                                },
                            },
                            { accessor: 'id', title: 'Contract Id', sortable: true, hidden: hideCols.includes('id') },
                            {
                                accessor: 'created_at',
                                title: 'Created At',
                                sortable: true,
                                hidden: hideCols.includes('created_at'),
                                render: ({ created_at }) => {
                                    const _date = created_at as string | number | Date;
                                    return dayjs(_date).format('DD MMM, YYYY | hh:mm:ss');
                                },
                            },
                            {
                                accessor: 'updated_at',
                                title: 'Updated At',
                                sortable: true,
                                hidden: hideCols.includes('updated_at'),
                                render: ({ updated_at }) => {
                                    const _date = updated_at as string | number | Date;
                                    return dayjs(_date).format('DD MMM YYYY');
                                },
                            },
                        ]}
                        onRowContextMenu={({ record, event }) =>
                            showContextMenu([
                                {
                                    key: 'view',
                                    title: `View group`,
                                    icon: <IconEye />,
                                    onClick: () => navigate(`/contracts/preview/${record.id}`),
                                },
                                // {
                                //     key: 'edit',
                                //     title: `Edit`,
                                //     icon: <IconPencil />,
                                //     onClick: () => editGroup(record),
                                // },
                                // {
                                //     hidden: record?.status === 'DEACTIVATED',
                                //     key: 'deactivate',
                                //     title: `Deactivate`,
                                //     icon: <IconX />,
                                //     onClick: () => handleMultiGroupDeActivation([{ id: record.id as string }], dispatch),
                                // },
                            ])(event)
                        }
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

                {showChangeLogModal && <ChangeLog showModal={showChangeLogModal} setShowModal={setShowChangeLogModal} changeLog={changelog} />}
            </div>
            {/* <CreateNewContract showModal={showModal} setShowModal={setShowModal} /> */}
        </div>
    );
};

export default Amendments;
