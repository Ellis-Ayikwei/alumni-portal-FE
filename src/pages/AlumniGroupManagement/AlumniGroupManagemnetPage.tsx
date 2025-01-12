import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import sortBy from 'lodash/sortBy';

import { useMediaQuery } from '@mantine/hooks';
import { useContextMenu } from 'mantine-contextmenu';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { downloadExcel } from 'react-export-table-to-excel';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import 'tippy.js/dist/tippy.css';
import Dropdown from '../../components/Dropdown';
import IconBell from '../../components/Icon/IconBell';
import IconBolt from '../../components/Icon/IconBolt';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconChecks from '../../components/Icon/IconChecks';
import IconEye from '../../components/Icon/IconEye';
import IconFile from '../../components/Icon/IconFile';
import IconLock from '../../components/Icon/IconLock';
import IconPencil from '../../components/Icon/IconPencil';
import IconPlus from '../../components/Icon/IconPlus';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconTrash from '../../components/Icon/IconTrash';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconUsersGroup from '../../components/Icon/IconUsersGroup';
import IconX from '../../components/Icon/IconX';
import { renderStatus } from '../../helper/renderStatus';
import showMessage from '../../helper/showMessage';
import { IRootState } from '../../store';
import { GetAlumniData } from '../../store/alumnigroupSlice';
import { setPageTitle } from '../../store/themeConfigSlice';
import AddMembersToGroup from './alumniGroupManagementUtils/addMembersToGroup';
import AddNewAlumniGroup from './alumniGroupManagementUtils/addNewGroup';
import handleMultiGroupActivation from './alumniGroupManagementUtils/multiGroupActivation';
import handleMultiGroupDeActivation from './alumniGroupManagementUtils/multiGroupDeActivation';
import handleMultiGroupDelete from './alumniGroupManagementUtils/multiGroupDelete';
import handleMultiGroupLocking from './alumniGroupManagementUtils/multiGroupLocking';

const col = ['name', 'start_date', 'end_date', 'insurance_package', 'is_locked', 'president_id', 'id', 'create_at', 'updated_at'];

const AlumniGroupManagementpage = () => {
    const dispatch = useDispatch();
    const [alumnidata, setUsersData] = useState<any>([]);
    const alumniData = useSelector((state: IRootState) => state.alumnidata.alumniGroups);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [addMembersToGroupModal, setAddMembersToGroupModal] = useState(false);
    const { showContextMenu } = useContextMenu();
    const [searchParams] = useSearchParams();
    const isTouch = useMediaQuery('(pointer: coarse)');

    useEffect(() => {
        dispatch(setPageTitle('Multiple Tables'));
        dispatch(GetAlumniData() as any);
    }, [dispatch]);

    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialGroupsRecords, setInitialGroupsRecords] = useState(sortBy(alumnidata, 'name'));
    const [recordsData, setRecordsData] = useState(initialGroupsRecords);
    const rowData = initialGroupsRecords;
    const [query, setQuery] = useState('');
    const [search, setSearch] = useState('');
    const [packageName, setPackageName] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    useEffect(() => {
        if (alumniData) {
            setInitialGroupsRecords(sortBy(alumniData, 'name'));
        }
        console.log('alumni data is ', alumniData);
    }, [alumniData]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialGroupsRecords.slice(from, to)]);
    }, [page, pageSize, initialGroupsRecords]);

    useEffect(() => {
        const data2 = sortBy(initialGroupsRecords, sortStatus.columnAccessor);
        setInitialGroupsRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortStatus]);

    useEffect(() => {
        dispatch(setPageTitle('Export Table'));
    });

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
            return Object.values(alumniData)?.filter(filterRecords);
        });

        console.log('the alumni data', alumniData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    useEffect(() => {
        setPackageName(searchParams.get('package_name') || '');
        setSearch(packageName);
    }, []);

    useEffect(() => {
        setSearch(packageName);
    }, [packageName]);

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

    const [AddUserModal, setAddUserModal] = useState<any>(false);

    const editGroup = (group: any = null) => {
        navigate(`/member/groups/edit/${group.id}`);
    };

    const viewGroup = (group: any = null) => {
        alert(Object.values(group));
        navigate(`/member/groups/preview/${group.id}`);
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
        { accessor: 'school', title: 'School', sortable: true },
        { accessor: 'status', title: 'Status', sortable: true },
        { accessor: 'president_id', title: 'President Id', sortable: true },
        { accessor: 'id', title: 'Id', sortable: true },
        { accessor: 'create_at', title: 'Create At', sortable: true },
        { accessor: 'updated_at', title: 'Updated At', sortable: true },
    ];

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
                    <h5 className="font-semibold text-lg dark:text-white-light">Alumni Groups Management</h5>
                </div>
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="flex items-center">
                        <button type="button" onClick={() => exportTable('csv')} className="btn btn-primary btn-sm m-1 ">
                            <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                            CSV
                        </button>
                        <button type="button" className="btn btn-primary btn-sm m-1" onClick={handleDownloadExcel}>
                            <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                            EXCEL
                        </button>
                        <button type="button" onClick={() => exportTable('print')} className="btn btn-primary btn-sm m-1">
                            <IconPrinter className="ltr:mr-2 rtl:ml-2" />
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
                        <button type="button" className="btn btn-dark w-8 h-8 p-0 rounded-full" onClick={() => dispatch(GetAlumniData() as any)}>
                            <IconRefresh className="w-5 h-5" />
                        </button>
                    </div>

                    <div className={` gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled ${selectedRecords.length > 0 ? '!flex' : 'hidden'}`}>
                        <div>
                            <Tippy content="Delete">
                                <button
                                    type="button"
                                    className="btn bg-red-500 hover:bg-red-600 w-8 h-8 p-0 rounded-xl shadow-md"
                                    onClick={() => handleMultiGroupDelete(selectedRecords, dispatch, setSelectedRecords)}
                                >
                                    <IconTrash className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>
                        <div>
                            <Tippy content="Activate">
                                <button
                                    type="button"
                                    onClick={() => handleMultiGroupActivation(selectedRecords, dispatch)}
                                    className="btn bg-green-500 hover:bg-green-600 h-8 w-8 px-1 rounded-xl shadow-md"
                                >
                                    <IconBolt className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>
                        <div>
                            <Tippy content="Deactivate">
                                <button
                                    type="button"
                                    onClick={() => handleMultiGroupDeActivation(selectedRecords, dispatch)}
                                    className="btn bg-red-900 hover:bg-green-600 h-8 w-8 px-1 rounded-xl shadow-md"
                                >
                                    <IconX className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>
                        <div>
                            <Tippy content="Lock">
                                <button
                                    type="button"
                                    onClick={() => handleMultiGroupLocking(selectedRecords, dispatch)}
                                    className="btn bg-yellow-500 hover:bg-yellow-800 h-8 w-8 px-1 rounded-xl shadow-md"
                                >
                                    <IconLock className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>

                        <div>
                            <Tippy content="Add Members">
                                <button type="button" className="btn bg-blue-500 hover:bg-blue-600 w-8 h-8 p-0 rounded-xl shadow-md" onClick={() => setAddMembersToGroupModal(true)}>
                                    <IconUserPlus className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto flex gap-1">
                        <div className="relative">
                            <input type="text" className="form-input w-auto pl-2 pr-12" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            <button type="button" className="absolute inset-y-0 right-0 flex items-center px-2" onClick={() => setSearch('')}>
                                <IconX className="w-5 h-5 text-gray-500 hover:text-gray-900" />
                            </button>
                        </div>
                        <Tippy content="Add New Alumni Group p-0">
                            <button
                                type="button"
                                className="btn-success flex btn px-1 py-0"
                                onClick={() => {
                                    setAddUserModal(true);
                                }}
                            >
                                <IconUsersGroup />
                                <IconPlus />
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
                                accessor: 'name',
                                title: 'Name',
                                sortable: true,
                                render: ({ name, id }) => {
                                    const grpName = name as string;

                                    return (
                                        <button className="flex items-center w-max" onClick={() => navigate(`/groups/preview/${id}`)}>
                                            <img className="w-9 h-9 rounded-full ltr:mr-2 rtl:ml-2 object-cover" src={`/assets/images/profile-${id}.jpeg`} alt="" />
                                            <div className="underline">{grpName}</div>
                                        </button>
                                    );
                                },
                            },

                            {
                                accessor: 'start_date',
                                title: 'Start Date',
                                sortable: true,
                                hidden: hideCols.includes('start_date'),
                                render: ({ start_date }) => {
                                    const validStart_date = start_date as string | number | Date;

                                    return dayjs(validStart_date).format('DD MMM YYYY');
                                },
                            },
                            {
                                accessor: 'end_date',
                                title: 'End Date',
                                sortable: true,
                                hidden: hideCols.includes('end_date'),
                                render: ({ end_date }) => {
                                    const validEnd_date = end_date as string | number | Date;

                                    return dayjs(validEnd_date).format('DD MMM YYYY');
                                },
                            },
                            { accessor: 'school', title: 'School', sortable: true, hidden: hideCols.includes('school') },
                            { accessor: 'insurance_package.name', title: 'Insurance Package', sortable: true, hidden: hideCols.includes('insurance_package') },
                            { accessor: 'current_contract_id', title: 'contract', sortable: true, hidden: hideCols.includes('current_contract_id'),
                                render: ({current_contract_id})=>(
                                    <button className="underline" 
                                    onClick={() => navigate(`/contracts/preview/${current_contract_id}`)}
                                >
                                    {String(current_contract_id || '')}
                                    </button>
                                )
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
                            { accessor: 'president.username', title: 'President', sortable: true, hidden: hideCols.includes('president') },
                            { accessor: 'id', title: 'ID', sortable: true, hidden: hideCols.includes('id') },
                            {
                                accessor: 'created_at',
                                title: 'Date Created',
                                sortable: true,
                                hidden: hideCols.includes('create_at'),
                                render: ({ created_at }) => {
                                    const grpDtCreated = created_at as string | number | Date;
                                    return dayjs(grpDtCreated).format('DD MMM YYYY');
                                },
                            },
                            {
                                accessor: 'updated_at',
                                title: 'Last Updated',
                                sortable: true,
                                hidden: hideCols.includes('updated_at'),
                                render: ({ updated_at }) => {
                                    const grpDtUpdated = updated_at as string | number | Date;
                                    return dayjs(grpDtUpdated).format('DD MMM YYYY');
                                },
                            },
                        ]}
                        totalRecords={initialGroupsRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        withTableBorder
                        withColumnBorders
                        striped
                        textSelectionDisabled={isTouch}
                        highlightOnHover
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={setSelectedRecords}
                        onRowClick={(row) => console.log(row)}
                        onRowContextMenu={({ record, event }) =>
                            showContextMenu([
                                {
                                    key: 'view',
                                    title: `View group`,
                                    icon: <IconEye />,
                                    onClick: () => viewGroup(record),
                                },
                                {
                                    key: 'edit',
                                    title: `Edit`,
                                    icon: <IconPencil />,
                                    onClick: () => editGroup(record),
                                },
                                {
                                    key: record.status === 'LOCKED' ? 'Lock' : 'Activate',
                                    title: `${record.status === 'LOCKED' ? 'Activate' : 'Lock'}`,
                                    color: record.status === 'LOCKED' ? 'green' : 'red',
                                    icon: record.status === 'LOCKED' ? <IconLock /> : <IconChecks />,
                                    onClick: () => {
                                        if (record.status === 'LOCKED') {
                                            handleMultiGroupActivation([{ id: record.id as string }], dispatch);
                                        } else {
                                            handleMultiGroupLocking([{ id: record.id as string }], dispatch);
                                        }
                                    },
                                },
                                {
                                    hidden: record?.status === 'DEACTIVATED',
                                    key: 'deactivate',
                                    title: `Deactivate`,
                                    icon: <IconX />,
                                    onClick: () => handleMultiGroupDeActivation([{ id: record.id as string }], dispatch),
                                },
                            ])(event)
                        }
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
            <AddMembersToGroup AddMembersToGroupModal={addMembersToGroupModal} setAddMembersToGroupModal={setAddMembersToGroupModal} groups={selectedRecords} />
            <AddNewAlumniGroup AddUserModal={AddUserModal} setAddUserModal={setAddUserModal} />
        </div>
    );
};

export default AlumniGroupManagementpage;
