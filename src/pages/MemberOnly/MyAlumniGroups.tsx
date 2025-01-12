import { Tab } from '@headlessui/react';
import dayjs from 'dayjs';
import { Fragment, useEffect } from 'react';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import useSwr from 'swr';
import Dropdown from '../../components/Dropdown';
import IconArrowForward from '../../components/Icon/IconArrowForward';
import IconChecks from '../../components/Icon/IconChecks';
import IconCircleCheck from '../../components/Icon/IconCircleCheck';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconMenuUsers from '../../components/Icon/Menu/IconMenuUsers';
import fetcher from '../../helper/fetcher';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';

const MyGroups = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('AdminDashboard'));
    });

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const userId = useSelector((state: IRootState) =>state.auth.user.id)

    const { data, error } = useSwr(`/alumni_groups/my_groups/${userId}`, fetcher);

    useEffect(() => {
        if (data) {
            console.log('the new data', data[0].is_one_time_payment_paid);
        }
    }, [data]);
    const navigate = useNavigate();

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>MyGroups</span>
                </li>
            </ul>
            {/* Justify Center Pills */}
            <div className="panel" id="justify_center_pills">
                <div className="mb-5">
                    <Tab.Group>
                        <Tab.List className="mt-3 flex flex-wrap justify-center space-x-2 rtl:space-x-reverse">
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${selected ? 'bg-success text-white !outline-none rounded-full' : ''}
                                                    before:inline-block' -mb-[1px] block rounded p-3.5 py-2 hover:bg-success hover:text-white hover:rounded-full`}
                                    >
                                        All Groups
                                        <span className="absolute -mt-3 -ml-2 rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold uppercase text-white">25</span>
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${selected ? 'bg-success text-white !outline-none rounded-full' : ''}
                                                    before:inline-block' -mb-[1px] block rounded p-3.5 py-2 hover:bg-success hover:text-white hover:rounded-full`}
                                    >
                                        Active <span className="absolute -mt-3 -ml-2 rounded-full bg-info px-1.5 py-0.5 text-xs font-semibold uppercase text-white">25</span>
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${selected ? 'bg-success text-white !outline-none rounded-full' : ''}
                                                    before:inline-block' -mb-[1px] block rounded p-3.5 py-2 hover:bg-success hover:text-white hover:rounded-full`}
                                    >
                                        Inactive
                                        <span className="absolute -mt-3 -ml-2 rounded-full bg-danger px-1.5 py-0.5 text-xs font-semibold uppercase text-white">25</span>
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${selected ? 'bg-success text-white !outline-none rounded-full' : ''}
                                                    before:inline-block' -mb-[1px] block rounded p-3.5 py-2 hover:bg-success hover:text-white hover:rounded-full`}
                                    >
                                        Paid
                                        <span className="absolute -mt-3 -ml-2 rounded-full bg-success px-1.5 py-0.5 text-xs font-semibold uppercase text-white">25</span>
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${selected ? 'bg-success text-white !outline-none rounded-full' : ''}
                                                    before:inline-block' -mb-[1px] block rounded p-3.5 py-2 hover:bg-success hover:text-white hover:rounded-full`}
                                    >
                                        Pending Payment
                                        <span className="absolute -mt-3 -ml-2 rounded-full bg-warning px-1.5 py-0.5 text-xs font-semibold uppercase text-white">25</span>
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${selected ? 'bg-success text-white !outline-none rounded-full' : ''}
                                                    before:inline-block' -mb-[1px] block rounded p-3.5 py-2 hover:bg-success hover:text-white hover:rounded-full`}
                                    >
                                        Pending Approval
                                        <span className="absolute -mt-3 -ml-2 rounded-full bg-danger px-1.5 py-0.5 text-xs font-semibold uppercase text-white">25</span>
                                    </button>
                                )}
                            </Tab>
                        </Tab.List>
                        <Tab.Panels>
                            <Tab.Panel>
                                <div className="active pt-5">
                                    <div className="pt-5">
                                        <div className="grid  sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                                            <div className=" h-full sm:col-span-3 xl:col-span-3">
                                                <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                    {/*  Previous Statement  */}
                                                    {data &&
                                                        data?.map((group: any) => (
                                                            <div key={group?.id} className="panel overflow-hidden">
                                                                <div className="items-center justify-between">
                                                                    <div>
                                                                        <div className="flex  w-full justify-between">
                                                                            <div className="text-lg font-bold">{group?.name}</div>
                                                                            <div className="dropdown">
                                                                                <Dropdown
                                                                                    offset={[0, 5]}
                                                                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                                                    btnClassName="hover:opacity-80"
                                                                                    button={<IconHorizontalDots className="hover:opacity-80 opacity-70" />}
                                                                                >
                                                                                    <ul>
                                                                                        <li>
                                                                                            <Link to={`/member/groups/preview/${group?.id}`}>View</Link>
                                                                                        </li>
                                                                                        <li>
                                                                                            <Link to={`/member/groups/edit/${group?.id}`}>Edit</Link>
                                                                                        </li>
                                                                                       
                                                                                    </ul>
                                                                                </Dropdown>
                                                                            </div>
                                                                        </div>
                                                                        {group?.is_one_time_payment_paid ? (
                                                                            <div className="text-success flex">
                                                                                {' '}
                                                                                <IconChecks className="text-success text-xs opacity-40 w-6 h-6" />
                                                                                Paid on June 27, 2022{' '}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-danger flex gap-1">
                                                                                <IconInfoCircle className="opacity-40 w-4 h-4" />
                                                                                Must Be Paid Before June 27, 2022{' '}
                                                                            </div>
                                                                        )}
                                                                        <div className="text-grey-400 flex items-center gap-2 mt-5">
                                                                            <b>Starts:</b> {dayjs(group?.start_date).format('ddd, DD MMM, YYYY')}
                                                                        </div>
                                                                        <div className="text-grey-400 flex items-center gap-2">
                                                                            <IconArrowForward className="text-danger opacity-40 w-6 h-6" /> <b>Ends:</b>{' '}
                                                                            {dayjs(group?.end_date).format('ddd, DD MMM, YYYY')}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-gray-200 h-1 rounded-full m-4"></div>
                                                                <div className="relative ">
                                                                    {group?.is_one_time_payment_paid ? (
                                                                        <div className="absolute -bottom-12 ltr:-right-12 rtl:-left-12 w-24 h-24">
                                                                            <IconCircleCheck className="text-success opacity-20 w-full h-full" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="absolute -bottom-12 ltr:-right-12 rtl:-left-12 w-24 h-24">
                                                                            <IconInfoCircle className="text-danger opacity-20 w-full h-full" />
                                                                        </div>
                                                                    )}
                                                                    <div className="">
                                                                        <div className="text-sm text-gray-600 flex items-center gap-1 w-full">
                                                                            President : <b>{group?.president?.full_name}</b>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-3 text-white-dark">
                                                                        <div className=" flex items-center">
                                                                            {' '}
                                                                            <IconMenuUsers className="" />
                                                                            <div className="font-semibold text-sm  ml-2">{group?.members?.length}</div>
                                                                        </div>

                                                                        <div className="flex items-center">
                                                                            {' '}
                                                                            <div className="font-semibold text-sm  ml-2">Active</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tab.Panel>
                            <Tab.Panel>
                                <div>
                                    <div className="flex items-start pt-5">
                                        <div className="h-20 w-20 flex-none ltr:mr-4 rtl:ml-4">
                                            <img src="/assets/images/profile-34.jpeg" alt="img" className="m-0 h-20 w-20 rounded-full object-cover ring-2 ring-[#ebedf2] dark:ring-white-dark" />
                                        </div>
                                        <div className="flex-auto">
                                            <h5 className="mb-4 text-xl font-medium">Media heading</h5>
                                            <p className="text-white-dark">
                                                Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at, tempus viverra
                                                turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Tab.Panel>
                            <Tab.Panel>
                                <div className="pt-5">
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                                        nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                    </p>
                                </div>
                            </Tab.Panel>
                            <Tab.Panel>Paid</Tab.Panel>
                            <Tab.Panel>Pending Payment</Tab.Panel>
                            <Tab.Panel>Pending Approval</Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </div>
    );
};

export default MyGroups;
