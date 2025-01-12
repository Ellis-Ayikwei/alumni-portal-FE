'use client';
import { Button, Stack } from '@mantine/core';
import { DatePicker, type DatesRangeValue } from '@mantine/dates';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import Tippy from '@tippyjs/react';
import dayjs from 'dayjs';
import sortBy from 'lodash/sortBy';
import { useContextMenu } from 'mantine-contextmenu';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { downloadExcel } from 'react-export-table-to-excel';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import 'tippy.js/dist/tippy.css';
import Dropdown from '../../components/Dropdown';
import IconBell from '../../components/Icon/IconBell';
import IconBolt from '../../components/Icon/IconBolt';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconEye from '../../components/Icon/IconEye';
import IconFile from '../../components/Icon/IconFile';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconTrash from '../../components/Icon/IconTrash';
import IconUser from '../../components/Icon/IconUser';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconUsersGroup from '../../components/Icon/IconUsersGroup';
import IconX from '../../components/Icon/IconX';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { GetUsersData } from '../../store/usersSlice';
import AddNewUser from './userManagementUtils/addNewUser';
import AddUserToGroup from './userManagementUtils/addUserToGroup';
import handleMultiUserActivation from './userManagementUtils/multiUserActivation';
import handleMultiUserDeActivation from './userManagementUtils/multiUserDeActivation';
import handleMultiUserDelete from './userManagementUtils/multiUserDelete';

const col = ['username', 'email', 'phone', 'address', 'created_at', 'dob', 'role', 'azure_id', 'id'];
const activityOption: { value: string; label: string }[] = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
];
const UserManagement = () => {
    const dispatch = useDispatch();
    // const [usersdata, setUsersData] = useState<any>([]);
    const usersData = useSelector((state: IRootState) => state.usersdata.usersData);
    const userDataIsLoadingStatus = useSelector((state: IRootState) => state.usersdata.loading);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const { showContextMenu } = useContextMenu();
    const isTouch = useMediaQuery('(pointer: coarse)');
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebouncedValue(query, 200);
    const [AddUserToGroupModal, setAddUserToGroupModal] = useState(false);
    const [usersToAddToALumniGroup, setUsersToAddToALumniGroup] = useState([]);

    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setinitialRecords] = useState(sortBy(usersData, 'first_name'));
    const [recordsData, setRecordsData] = useState<any[]>(initialRecords);
    const rowData = initialRecords;
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'first_name',
        direction: 'asc',
    });

    const [selectedActivity, setSelectedActivity] = useState<string[]>([]);
    const [birthdaySearchRange, setBirthdaySearchRange] = useState<DatesRangeValue>();

    const [activeFilter, setActiveFilter] = useState<string | undefined>();
    const resetActiveFilter = () => {
        setRecordsData(initialRecords);
        setActiveFilter;
    };
    useEffect(() => {
        setRecordsData(
            initialRecords.filter(({ first_name, last_name, dob, is_active }: { first_name: any; last_name: any; dob: any; is_active: any }) => {
                if (debouncedQuery !== '' && !`${first_name} ${last_name}`.toLowerCase().includes(debouncedQuery.trim().toLowerCase())) return false;

                if (
                    birthdaySearchRange &&
                    birthdaySearchRange[0] &&
                    birthdaySearchRange[1] &&
                    (dayjs(birthdaySearchRange[0]).isAfter(dob, 'day') || dayjs(birthdaySearchRange[1]).isBefore(dob, 'day'))
                )
                    return false;
                console.log(is_active, activeFilter);
                if (typeof is_active !== 'undefined' && activeFilter !== undefined && is_active.toString() !== activeFilter.toString()) return false;

                return true;
            })
        );
    }, [debouncedQuery, birthdaySearchRange, activeFilter]);

    useEffect(() => {
        dispatch(setPageTitle('Multiple Tables'));
        dispatch(GetUsersData() as any);
    }, [dispatch]);

    useEffect(() => {
        if (usersData) {
            setinitialRecords(sortBy(usersData, 'first_name'));
        }
    }, [usersData]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setRecordsData(() => {
            return Object.values(usersData)?.filter((item: any) => {
                const accessors = Object.keys(item) as (keyof typeof item)[];
                return accessors.some((accessor) => {
                    const value = item[accessor];
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(search.toLowerCase());
                    }
                    if (typeof value === 'number') {
                        return value.toString().includes(search.toLowerCase());
                    }
                    return false;
                });
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setinitialRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortStatus]);

    const getActivityColor = (accessor: string | boolean) => {
        const colors = ['success', 'danger'];
        if (accessor === true) {
            return colors[0];
        } else if (accessor === false || accessor === 'disapproved') {
            return colors[1];
        } else {
            return '';
        }
    };

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

    const [AddUserModal, setAddUserModal] = useState<any>(false);

    const editUser = (user: any = null) => {
        navigate('/userAccountSetting');
    };

    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [hideCols, setHideCols] = useState<any>(['id', 'azure_id']);

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        { accessor: 'username', title: 'Username', sortable: true },
        { accessor: 'email', title: 'Email', sortable: true },
        { accessor: 'phone', title: 'Phone No.', sortable: true },
        { accessor: 'address', title: 'Address', sortable: true },
        {
            accessor: 'created_at',
            title: 'Date joined',
            sortable: true,
        },
        { accessor: 'dob', title: 'DOB', sortable: true },
        { accessor: 'role', title: 'Role', sortable: true },
        { accessor: 'azure_id', title: 'Azure_id', sortable: true },
        { accessor: 'id', title: 'User id', sortable: true },
    ];

    const handleNavigation = (payload: any) => {
        navigate('/profile', { state: payload });
    };

    const handleAddToAlumniGroup = (selectedRecords: any, dispatch: Dispatch<AnyAction>): void => {
        setUsersToAddToALumniGroup(selectedRecords);
        setAddUserToGroupModal(true);
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
            <div className="panel mt-6  rounded-lg shadow-lg">
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <h5 className="font-semibold text-lg ">User Management</h5>
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
                            <button type="button" className="btn btn-dark w-8 h-8 p-0 rounded-full" onClick={() => dispatch(GetUsersData() as any)}>
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
                                    onClick={() => handleMultiUserDelete(selectedRecords, dispatch, setSelectedRecords)}
                                >
                                    <IconTrash className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>
                        <div>
                            <Tippy content="Activate">
                                <button
                                    type="button"
                                    onClick={() => handleMultiUserActivation(selectedRecords, dispatch)}
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
                                    onClick={() => handleMultiUserDeActivation(selectedRecords, dispatch)}
                                    className="btn bg-red-900 hover:bg-green-600 h-8 w-8 px-1 rounded-xl shadow-md"
                                >
                                    <IconX className="w-5 h-5 text-white" />
                                </button>
                            </Tippy>
                        </div>
                        <div>
                            <Tippy content="Add To Alumni Group">
                                <button type="button" className="btn bg-blue-500 hover:bg-blue-600 w-8 h-8 p-0 rounded-xl shadow-md" onClick={() => handleAddToAlumniGroup(selectedRecords, dispatch)}>
                                    <IconUsersGroup className="w-5 h-5 text-white" />
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
                        <Tippy content="Add A New User">
                            <button
                                type="button"
                                className="btn btn-success w-8  p-0 "
                                onClick={() => {
                                    setAddUserModal(true);
                                }}
                            >
                                <IconUserPlus className="" />
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
                                accessor: 'full_name',
                                title: 'Name',
                                sortable: true,
                                render: ({ full_name, id }) => {
                                    const _fullname = full_name as string
                                    
                                    return (<div className="flex items-center w-max">
                                        {false ? (
                                            <img className="w-9 h-9 rounded-full ltr:mr-2 rtl:ml-2 object-cover" src={`/assets/images/profile-${id}.jpeg`} alt="" />
                                        ) : (
                                            <IconUser className="w-7 h-7 rounded-full bg-slate-400 ltr:mr-2 rtl:ml-2 p-1" />
                                        )}
                                        <button className="underline" onClick={() => navigate(`/userAccountSetting/${id}`)}>{_fullname}</button>
                                    </div>) 
                                },
                            },
                            {
                                accessor: 'role',
                                title: 'Role',
                                sortable: true,
                                hidden: hideCols.includes('role'),
                            },
                            { accessor: 'username', title: 'Username', sortable: true, hidden: hideCols.includes('username') },
                            { accessor: 'email', title: 'Email', sortable: true, hidden: hideCols.includes('email') },
                            { accessor: 'phone', title: 'Phone No.', sortable: true, hidden: hideCols.includes('phone') },
                            {
                                accessor: 'address',
                                title: 'Address',
                                sortable: true,
                                hidden: hideCols.includes('address'),
                            },
                            {
                                accessor: 'occupation',
                                title: 'Occupation',
                                sortable: true,
                                hidden: hideCols.includes('occupation'),
                            },
                            {
                                accessor: 'dob',
                                title: 'DOB',
                                sortable: true,
                                hidden: hideCols.includes('dob'),
                                render: ({ dob }) => {
                                    const usrDob = dob as string | number | Date | undefined;
                                    return dayjs(usrDob).format('DD MMM YYYY');
                                },
                                filter: ({ close }) => (
                                    <Stack>
                                        <DatePicker className="max-w-sm" maxDate={new Date()} type="range" value={birthdaySearchRange} onChange={setBirthdaySearchRange} />
                                        <Button
                                            disabled={!birthdaySearchRange}
                                            variant="light"
                                            onClick={() => {
                                                setBirthdaySearchRange(undefined);
                                                close();
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    </Stack>
                                ),
                                filtering: Boolean(birthdaySearchRange),
                            },
                            {
                                accessor: 'is_active',
                                title: 'Active',
                                sortable: true,
                                hidden: hideCols.includes('Active'),
                                render: ({ is_active }) => {
                                    const active = is_active as string | boolean;
                                    return <span className={`badge bg-${getActivityColor(active)}`}>{active ? 'Active' : 'Inactive'}</span>;
                                },
                                filter: ({ close }) => (
                                    <Stack>
                                        <div className="text-end ltr:ml-auto rtl:mr-auto" onClick={close}>
                                            <IconX />
                                        </div>
                                        <Select
                                            className="max-w-sm"
                                            value={activeFilter}
                                            onChange={(selectedOption) => {
                                                const value = selectedOption ? (selectedOption as unknown as { value: string }).value : undefined;
                                                console.log('value', activeFilter, value);
                                                setActiveFilter(value);
                                            }}
                                            options={activityOption.map((option) => option.value)}
                                        />
                                        <Button
                                            disabled={!activeFilter}
                                            variant="light"
                                            onClick={() => {
                                                close();
                                                resetActiveFilter();
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    </Stack>
                                ),
                            },
                            {
                                accessor: 'created_at',
                                title: 'Date joined',
                                sortable: true,
                                hidden: hideCols.includes('created_at'),
                                render: ({ created_at }) => {
                                    const validDob = created_at as string | number | Date;

                                    return <div>{formatDate(created_at)}</div>;
                                },
                            },
                          
                            { accessor: 'azure_id', title: 'Azure_id', sortable: true, hidden: hideCols.includes('azure_id') },
                            { accessor: 'id', title: 'User id', sortable: true, hidden: hideCols.includes('id') },
                        ]}
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        withTableBorder
                        borderRadius="sm"
                        withColumnBorders
                        striped
                        highlightOnHover
                        page={page}
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
                                    title: `View user ${record.username}`,
                                    icon: <IconEye />,
                                    onClick: () => navigate(`/userAccountSetting/${record.id}`),
                                },
                            ])(event)
                        }
                        textSelectionDisabled={isTouch}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
            {AddUserModal && <AddNewUser AddUserModal={AddUserModal} setAddUserModal={setAddUserModal} />}
            {AddUserToGroupModal && <AddUserToGroup AddUserToGroupModal={AddUserToGroupModal} setAddUserToGroupModal={setAddUserToGroupModal} usersToAddToALumniGroup={usersToAddToALumniGroup} />}{' '}
        </div>
    );
};

export default UserManagement;
