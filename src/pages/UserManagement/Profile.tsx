import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Dropdown from '../../components/Dropdown';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconClock from '../../components/Icon/IconClock';
import IconCoffee from '../../components/Icon/IconCoffee';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import IconLock from '../../components/Icon/IconLock';
import IconMail from '../../components/Icon/IconMail';
import IconMapPin from '../../components/Icon/IconMapPin';
import IconPencilPaper from '../../components/Icon/IconPencilPaper';
import IconPhone from '../../components/Icon/IconPhone';
import IconShoppingBag from '../../components/Icon/IconShoppingBag';
import IconUsersGroup from '../../components/Icon/IconUsersGroup';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';

const Profile = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    useEffect(() => {
        dispatch(setPageTitle('Profile'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const data = location.state || {};
    console.log('data', data);
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Users
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Profile</span>
                </li>
            </ul>
            <div className="pt-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5">
                    <div className="panel">
                        <div className="flex items-center justify-between mb-5">
                            <h5 className="font-semibold text-lg dark:text-white-light">Profile</h5>
                            <Link to="/users/user-account-settings" className="ltr:ml-auto rtl:mr-auto btn btn-primary p-2 rounded-full">
                                <IconPencilPaper />
                            </Link>
                        </div>
                        <div className="mb-5">
                            <div className="flex flex-col justify-center items-center">
                                <img src="/assets/images/profile-34.jpeg" alt="img" className="w-24 h-24 rounded-full object-cover  mb-5" />
                                <p className="font-semibold text-primary text-xl">
                                    {data.last_name} {data.first_name} {data.other_names}
                                </p>
                                <p className="font-semibold text-secndary text-sm">@{data.username}</p>
                            </div>
                            <ul className="mt-5 flex flex-col max-w-[160px] m-auto space-y-4 font-semibold text-white-dark">
                                <li className="flex items-center gap-2">
                                    <IconCoffee className="shrink-0" />
                                    {data.occupation}
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCalendar className="shrink-0" />
                                    {new Date(data.dob).toDateString()}
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconMapPin className="shrink-0" />
                                    {data.address}
                                </li>
                                <li>
                                    <button className="flex items-center gap-2">
                                        <IconMail className="w-5 h-5 shrink-0" />
                                        <span className="text-primary truncate">{data.email}</span>
                                    </button>
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconPhone />
                                    <span className="whitespace-nowrap" dir="ltr">
                                        {data.phone}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="panel lg:col-span-2 xl:col-span-3 ">
                        <div className="mb-5">
                            <h5 className="font-semibold text-lg dark:text-white-light">Alumi Groups</h5>
                        </div>

                        <div className="space-y-4 overflow-y-scroll max-h-[300px]">
                            <div className="border border-[#ebedf2] rounded dark:bg-[#1b2e4b] dark:border-0">
                                <div className="flex items-center justify-between p-4 py-2">
                                    <div className="grid place-content-center w-9 h-9 rounded-md bg-secondary-light dark:bg-secondary text-secondary dark:text-secondary-light">
                                        <IconShoppingBag />
                                    </div>
                                    <div className="w-full">
                                        <div className="ltr:ml-4 rtl:mr-4 mb-3 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="block text-base text-[#515365] dark:text-white-light">Group Name</span>
                                                the best group 2013
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">President: Mr. Smith</p>
                                        </div>
                                        <div className="ltr:ml-4 rtl:mr-4 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="flex text-base gap-2 text-[#515365] dark:text-white-light">
                                                    <IconUsersGroup className="w-5 h-5" />
                                                    65
                                                    <IconLock className="w-5 h-5" /> Locked
                                                </span>
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">
                                                <button type="button" className="text-primary font-semibold hover:underline group">
                                                    View Group{' '}
                                                    <IconArrowLeft className="ltr:ml-1 rtl:mr-1 inline-block relative transition-all duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180" />
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border border-[#ebedf2] rounded dark:bg-[#1b2e4b] dark:border-0">
                                <div className="flex items-center justify-between p-4 py-2">
                                    <div className="grid place-content-center w-9 h-9 rounded-md bg-secondary-light dark:bg-secondary text-secondary dark:text-secondary-light">
                                        <IconShoppingBag />
                                    </div>
                                    <div className="w-full">
                                        <div className="ltr:ml-4 rtl:mr-4 mb-3 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="block text-base text-[#515365] dark:text-white-light">Group Name</span>
                                                the best group 2013
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">President: Mr. Smith</p>
                                        </div>
                                        <div className="ltr:ml-4 rtl:mr-4 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="flex text-base gap-2 text-[#515365] dark:text-white-light">
                                                    <IconUsersGroup className="w-5 h-5" />
                                                    65
                                                    <IconLock className="w-5 h-5" /> Locked
                                                </span>
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">
                                                <button type="button" className="text-primary font-semibold hover:underline group">
                                                    View Group{' '}
                                                    <IconArrowLeft className="ltr:ml-1 rtl:mr-1 inline-block relative transition-all duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180" />
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border border-[#ebedf2] rounded dark:bg-[#1b2e4b] dark:border-0">
                                <div className="flex items-center justify-between p-4 py-2">
                                    <div className="grid place-content-center w-9 h-9 rounded-md bg-secondary-light dark:bg-secondary text-secondary dark:text-secondary-light">
                                        <IconShoppingBag />
                                    </div>
                                    <div className="w-full">
                                        <div className="ltr:ml-4 rtl:mr-4 mb-3 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="block text-base text-[#515365] dark:text-white-light">Group Name</span>
                                                the best group 2013
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">President: Mr. Smith</p>
                                        </div>
                                        <div className="ltr:ml-4 rtl:mr-4 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="flex text-base gap-2 text-[#515365] dark:text-white-light">
                                                    <IconUsersGroup className="w-5 h-5" />
                                                    65
                                                    <IconLock className="w-5 h-5" /> Locked
                                                </span>
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">
                                                <button type="button" className="text-primary font-semibold hover:underline group">
                                                    View Group{' '}
                                                    <IconArrowLeft className="ltr:ml-1 rtl:mr-1 inline-block relative transition-all duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180" />
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border border-[#ebedf2] rounded dark:bg-[#1b2e4b] dark:border-0">
                                <div className="flex items-center justify-between p-4 py-2">
                                    <div className="grid place-content-center w-9 h-9 rounded-md bg-secondary-light dark:bg-secondary text-secondary dark:text-secondary-light">
                                        <IconShoppingBag />
                                    </div>
                                    <div className="w-full">
                                        <div className="ltr:ml-4 rtl:mr-4 mb-3 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="block text-base text-[#515365] dark:text-white-light">Group Name</span>
                                                the best group 2013
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">President: Mr. Smith</p>
                                        </div>
                                        <div className="ltr:ml-4 rtl:mr-4 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="flex text-base gap-2 text-[#515365] dark:text-white-light">
                                                    <IconUsersGroup className="w-5 h-5" />
                                                    65
                                                    <IconLock className="w-5 h-5" /> Locked
                                                </span>
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">
                                                <button type="button" className="text-primary font-semibold hover:underline group">
                                                    View Group{' '}
                                                    <IconArrowLeft className="ltr:ml-1 rtl:mr-1 inline-block relative transition-all duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180" />
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border border-[#ebedf2] rounded dark:bg-[#1b2e4b] dark:border-0">
                                <div className="flex items-center justify-between p-4 py-2">
                                    <div className="grid place-content-center w-9 h-9 rounded-md bg-secondary-light dark:bg-secondary text-secondary dark:text-secondary-light">
                                        <IconShoppingBag />
                                    </div>
                                    <div className="w-full">
                                        <div className="ltr:ml-4 rtl:mr-4 mb-3 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="block text-base text-[#515365] dark:text-white-light">Group Name</span>
                                                the best group 2013
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">President: Mr. Smith</p>
                                        </div>
                                        <div className="ltr:ml-4 rtl:mr-4 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="flex text-base gap-2 text-[#515365] dark:text-white-light">
                                                    <IconUsersGroup className="w-5 h-5" />
                                                    65
                                                    <IconLock className="w-5 h-5" /> Locked
                                                </span>
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">
                                                <button type="button" className="text-primary font-semibold hover:underline group">
                                                    View Group{' '}
                                                    <IconArrowLeft className="ltr:ml-1 rtl:mr-1 inline-block relative transition-all duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180" />
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border border-[#ebedf2] rounded dark:bg-[#1b2e4b] dark:border-0">
                                <div className="flex items-center justify-between p-4 py-2">
                                    <div className="grid place-content-center w-9 h-9 rounded-md bg-secondary-light dark:bg-secondary text-secondary dark:text-secondary-light">
                                        <IconShoppingBag />
                                    </div>
                                    <div className="w-full">
                                        <div className="ltr:ml-4 rtl:mr-4 mb-3 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="block text-base text-[#515365] dark:text-white-light">Group Name</span>
                                                the best group 2013
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">President: Mr. Smith</p>
                                        </div>
                                        <div className="ltr:ml-4 rtl:mr-4 flex items-start justify-between flex-auto font-semibold">
                                            <h6 className="text-white-dark text-[13px] dark:text-white-dark">
                                                <span className="flex text-base gap-2 text-[#515365] dark:text-white-light">
                                                    <IconUsersGroup className="w-5 h-5" />
                                                    65
                                                    <IconLock className="w-5 h-5" /> Locked
                                                </span>
                                            </h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-secondary">
                                                <button type="button" className="text-primary font-semibold hover:underline group">
                                                    View Group{' '}
                                                    <IconArrowLeft className="ltr:ml-1 rtl:mr-1 inline-block relative transition-all duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180" />
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="panel">
                        <div className="flex items-center justify-between mb-10">
                            <h5 className="font-semibold text-lg dark:text-white-light">Contracts</h5>
                        </div>
                        <div className="border border-[#ebedf2] rounded dark:bg-[#1b2e4b] dark:border-0">
                            <div className="items-center justify-between p-4 py-2">
                                <div className="group">
                                    <ul className="list-inside list-disc text-white-dark font-semibold mb-7 space-y-2">
                                        <li>10,000 Monthly Visitors</li>
                                        <li>Unlimited Reports</li>
                                        <li>signed On 20th march</li>
                                        <li>
                                            Under writer: <b>John D</b>
                                        </li>
                                    </ul>
                                    <div className="flex items-center justify-between mb-4 font-semibold">
                                        <p className="flex items-center rounded-full bg-dark px-2 py-1 text-xs text-white-light font-semibold">
                                            <IconClock className="w-3 h-3 ltr:mr-1 rtl:ml-1" />5 Days Left To Renew
                                        </p>
                                        <p className="ltr:ml-auto rtl:mr-auto text-secondary">
                                            <button type="button" className="text-primary font-semibold hover:underline group">
                                                View Contract{' '}
                                                <IconArrowLeft className="ltr:ml-1 rtl:mr-1 inline-block relative transition-all duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180" />
                                            </button>
                                        </p>
                                    </div>
                                    <div className="rounded-full h-2.5 p-0.5 bg-dark-light overflow-hidden mb-5 dark:bg-dark-light/10">
                                        <div className="bg-gradient-to-r from-[#f67062] to-[#fc5296] w-full h-full rounded-full relative" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="panel">
                        <div className="flex items-center justify-between mb-5">
                            <h5 className="font-semibold text-lg dark:text-white-light">Payment History</h5>
                        </div>
                        <div>
                            <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                                <div className="flex items-center justify-between py-2">
                                    <h6 className="text-[#515365] font-semibold dark:text-white-dark">
                                        March
                                        <span className="block text-white-dark dark:text-white-light">Pro Membership</span>
                                    </h6>
                                    <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                                        <p className="font-semibold">90%</p>
                                        <div className="dropdown ltr:ml-4 rtl:mr-4">
                                            <Dropdown
                                                offset={[0, 5]}
                                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                btnClassName="hover:text-primary"
                                                button={<IconHorizontalDots className="opacity-80 hover:opacity-100" />}
                                            >
                                                <ul className="!min-w-[150px]">
                                                    <li>
                                                        <button type="button">View Invoice</button>
                                                    </li>
                                                    <li>
                                                        <button type="button">Download Invoice</button>
                                                    </li>
                                                </ul>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                                <div className="flex items-center justify-between py-2">
                                    <h6 className="text-[#515365] font-semibold dark:text-white-dark">
                                        February
                                        <span className="block text-white-dark dark:text-white-light">Pro Membership</span>
                                    </h6>
                                    <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                                        <p className="font-semibold">90%</p>
                                        <div className="dropdown ltr:ml-4 rtl:mr-4">
                                            <Dropdown offset={[0, 5]} placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`} button={<IconHorizontalDots className="opacity-80 hover:opacity-100" />}>
                                                <ul className="!min-w-[150px]">
                                                    <li>
                                                        <button type="button">View Invoice</button>
                                                    </li>
                                                    <li>
                                                        <button type="button">Download Invoice</button>
                                                    </li>
                                                </ul>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between py-2">
                                    <h6 className="text-[#515365] font-semibold dark:text-white-dark">
                                        January
                                        <span className="block text-white-dark dark:text-white-light">Pro Membership</span>
                                    </h6>
                                    <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                                        <p className="font-semibold">90%</p>
                                        <div className="dropdown ltr:ml-4 rtl:mr-4">
                                            <Dropdown offset={[0, 5]} placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`} button={<IconHorizontalDots className="opacity-80 hover:opacity-100" />}>
                                                <ul className="!min-w-[150px]">
                                                    <li>
                                                        <button type="button">View Invoice</button>
                                                    </li>
                                                    <li>
                                                        <button type="button">Download Invoice</button>
                                                    </li>
                                                </ul>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
