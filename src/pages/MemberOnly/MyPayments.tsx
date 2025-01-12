import { faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import sortBy from 'lodash/sortBy';
import { useEffect, useState } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useSwr from 'swr';
import IconArrowBackward from '../../components/Icon/IconArrowBackward';
import IconCashBanknotes from '../../components/Icon/IconCashBanknotes';
import IconEye from '../../components/Icon/IconEye';

import dayjs from 'dayjs';
import Ghc from '../../helper/CurrencyFormatter';
import fetcher from '../../helper/fetcher';
import { renderStatus } from '../../helper/renderStatus';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import MakePaymentModal from './MyPaymentUtils/MakePaymentModal';

const dummyPaymentData = {
    id: 1,
    member: { name: 'John Doe', email: 'pKsZl@example.com' },
    amount: '100.00',
    description: 'Payment for premium subscription',
    status: 'pending',
};
const MyPayments = () => {
    const dispatch = useDispatch();
    const auth = useAuthUser<{ id: string }>();
    useEffect(() => {
        dispatch(setPageTitle('Sales Admin'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const userId = auth?.id;

    const [loading] = useState(false);

    //Revenue Chart
    const revenueChart: any = {
        series: [
            {
                name: 'Income',
                data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000],
            },
            {
                name: 'Expenses',
                data: [16500, 17500, 16200, 17300, 16000, 19500, 16000, 17000, 16000, 19000, 18000, 19000],
            },
        ],
        options: {
            chart: {
                height: 325,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },

            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                curve: 'smooth',
                width: 2,
                lineCap: 'square',
            },
            dropShadow: {
                enabled: true,
                opacity: 0.2,
                blur: 10,
                left: -7,
                top: 22,
            },
            colors: isDark ? ['#2196F3', '#E7515A'] : ['#1B55E2', '#E7515A'],
            markers: {
                discrete: [
                    {
                        seriesIndex: 0,
                        dataPointIndex: 6,
                        fillColor: '#1B55E2',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                    {
                        seriesIndex: 1,
                        dataPointIndex: 5,
                        fillColor: '#E7515A',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                ],
            },
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                crosshairs: {
                    show: true,
                },
                labels: {
                    offsetX: isRtl ? 2 : 0,
                    offsetY: 5,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-xaxis-title',
                    },
                },
            },
            yaxis: {
                tickAmount: 7,
                labels: {
                    formatter: (value: number) => {
                        return value / 1000 + 'K';
                    },
                    offsetX: isRtl ? -30 : -10,
                    offsetY: 0,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-yaxis-title',
                    },
                },
                opposite: isRtl ? true : false,
            },
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: false,
                    },
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '16px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5,
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
                x: {
                    show: false,
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: isDark ? 0.19 : 0.28,
                    opacityTo: 0.05,
                    stops: isDark ? [100, 100] : [45, 100],
                },
            },
        },
    };

    //Sales By Category
    const salesByCategory: any = {
        series: [985, 737, 270],
        options: {
            chart: {
                type: 'donut',
                height: 460,
                fontFamily: 'Nunito, sans-serif',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 25,
                colors: isDark ? '#0e1726' : '#fff',
            },
            colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'] : ['#e2a03f', '#5c1ac3', '#e7515a'],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                height: 50,
                offsetY: 20,
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '29px',
                                offsetY: -10,
                            },
                            value: {
                                show: true,
                                fontSize: '26px',
                                color: isDark ? '#bfc9d4' : undefined,
                                offsetY: 16,
                                formatter: (val: any) => {
                                    return val;
                                },
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#888ea8',
                                fontSize: '29px',
                                formatter: (w: any) => {
                                    return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                        return a + b;
                                    }, 0);
                                },
                            },
                        },
                    },
                },
            },
            labels: ['Apparel', 'Sports', 'Others'],
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
            },
        },
    };

    //Daily Sales
    const dailySales: any = {
        series: [
            {
                name: 'Sales',
                data: [44, 55, 41, 67, 22, 43, 21],
            },
            {
                name: 'Last Week',
                data: [13, 23, 20, 8, 13, 27, 33],
            },
        ],
        options: {
            chart: {
                height: 160,
                type: 'bar',
                fontFamily: 'Nunito, sans-serif',
                toolbar: {
                    show: false,
                },
                stacked: true,
                stackType: '100%',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 1,
            },
            colors: ['#e2a03f', '#e0e6ed'],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 0,
                        },
                    },
                },
            ],
            xaxis: {
                labels: {
                    show: false,
                },
                categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
            },
            yaxis: {
                show: false,
            },
            fill: {
                opacity: 1,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '25%',
                },
            },
            legend: {
                show: false,
            },
            grid: {
                show: false,
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
                padding: {
                    top: 10,
                    right: -20,
                    bottom: -20,
                    left: -20,
                },
            },
        },
    };

    //Total Orders
    const totalOrders: any = {
        series: [
            {
                name: 'Sales',
                data: [28, 40, 36, 52, 38, 60, 38, 52, 36, 40],
            },
        ],
        options: {
            chart: {
                height: 290,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                sparkline: {
                    enabled: true,
                },
            },
            stroke: {
                curve: 'smooth',
                width: 2,
            },
            colors: isDark ? ['#00ab55'] : ['#00ab55'],
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            yaxis: {
                min: 0,
                show: false,
            },
            grid: {
                padding: {
                    top: 125,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            fill: {
                opacity: 1,
                type: 'gradient',
                gradient: {
                    type: 'vertical',
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: 0.3,
                    opacityTo: 0.05,
                    stops: [100, 100],
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
            },
        },
    };

    const [tableData, setTableData] = useState([
        { id: 1, name: 'John Doe', date: '2023-01-01', sale: '100', status: 'completed' },
        { id: 2, name: 'Jane Smith', date: '2023-01-02', sale: '200', status: 'Pending' },
        { id: 3, name: 'Alice Johnson', date: '2023-01-03', sale: '150', status: 'In Progress' },
        { id: 4, name: 'Bob Brown', date: '2023-01-04', sale: '250', status: 'Canceled' },
    ]);

    const [paymentData, setPaymentData] = useState<any>(dummyPaymentData);

    const overdue = false;

    const [isPaymentModalOpened, setIsPaymentModalOpened] = useState(false);
    const handleOpenPaymentModal = () => {
        // Define the data you want to pass to the modal
        const data = {
            amount: '100.00',
            description: 'Payment for premium subscription',
        };
        setPaymentData(data);
        setIsPaymentModalOpened(true);
    };

    const { data: myPayments, error: myPaymentsError } = useSwr(`/payments/users_payments/${userId}`, fetcher);

    const sortedPaymentsByDate = sortBy(myPayments, 'created_at').reverse();
    console.log('sortedPaymentsByDate', sortedPaymentsByDate);
    const lastPaymentMade = myPayments && myPayments.length > 0 ? myPayments[myPayments.length - 1] : null;
    const allSuccefullPayments = myPayments && myPayments.length > 0 ? myPayments.filter((payment: any) => payment.status === 'COMPLETED') : [];
    const allPaid = allSuccefullPayments?.reduce((total: number, payment: any) => {
        return total + payment.amount;
    }, 0);
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="/" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Sales</span>
                </li>
            </ul>

            <div className="flex items-center lg:justify-between flex-wrap gap-4 mt-6">
                <Link to="/apps/invoice/edit" className="btn btn-danger gap-2">
                    <IconArrowBackward />
                    Back
                </Link>
                <div className="flex !gap-2">
                    <button className="btn btn-info gap-2 bg-[#E7515A] text-white" onClick={() => setIsPaymentModalOpened(true)}>
                        <FontAwesomeIcon icon={faUnlockAlt} />
                        Make Payment
                    </button>
                </div>
            </div>
            <div className="grid xl:grid-cols-3  grid-cols-1 gap-4 lg:items-start md:items-center">
                <div className="pt-5 h-full xl:col-span-2">
                    <div className="grid sm:grid-cols-1 xl:grid-cols-2 gap-6 mb-6 justify-between w-full">
                        <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                            <div className="mb-5">
                                <span className="bg-[#1b2e4b] text-cyan-300 text-sm rounded-full px-4 py-1.5 before:bg-cyan-500 before:w-1.5 before:h-1.5 before:rounded-full ltr:before:mr-2 rtl:before:ml-2 before:inline-block">
                                    Total Paid
                                </span>
                            </div>
                            <div className="flex items-center mt-5">
                                <div className="text-xl sm:text-sm md:text-xl lg:text-2xl xl:text-3xl font-bold ltr:mr-3 rtl:ml-3 flex items-center gap-2"> {Ghc(allPaid)} </div>
                            </div>
                            <div className="flex items-center font-semibold mt-5">for 5 groups</div>
                        </div>
                        <div className="panel bg-gradient-to-r from-amber-400 to-amber-500">
                            <div className="mb-5">
                                <span className="bg-[#1b2e4b] text-amber-300 sm:text-xs rounded-full px-4 py-1.5 before:bg-amber-600 before:w-1.5 before:h-1.5 before:rounded-full ltr:before:mr-2 rtl:before:ml-2 before:inline-block">
                                    Total Outstanding
                                </span>
                            </div>
                            <div className="flex items-center mt-5">
                                <div className="text-xl font-bold ltr:mr-3 rtl:ml-3 flex items-center gap-2"> GHC 170.00 </div>
                            </div>
                            <div className="flex items-center font-semibold mt-5">for 5 groups</div>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-6 mb-6 justify-between w-full">
                        <div className="panel  p-0 border-0 overflow-hidden col-span-1">
                            <div className="p-5">
                                <div className="mb-5">
                                    <span className="bg-[#1b2e4b] text-white text-xs rounded-full px-4 py-1.5 before:bg-white before:w-1.5 before:h-1.5 ltr:before:mr-2 rtl:before:ml-2 before:inline-block">
                                        Last Payment Made
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    {lastPaymentMade && (
                                        <div className="flex panel">
                                            <span
                                                className={`shrink-0 grid place-content-center text-base w-9 h-9 rounded-md bg-${
                                                    lastPaymentMade?.status === 'COMPLETED' ? 'green-50' : lastPaymentMade?.status === 'PENDING' ? 'yellow-50' : 'red-50'
                                                } text-${lastPaymentMade?.status === 'COMPLETED' ? 'success' : lastPaymentMade?.status === 'PENDING' ? 'info' : 'danger'} dark:text-success-light`}
                                            >
                                                {<IconCashBanknotes />}
                                            </span>
                                            <div className="px-3 flex-1">
                                                <span
                                                    className={`text-${
                                                        lastPaymentMade?.status === 'COMPLETED' ? 'success' : lastPaymentMade?.status === 'PENDING' ? 'info' : 'danger'
                                                    } text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre`}
                                                >
                                                    {Ghc(lastPaymentMade?.amount)}
                                                </span>
                                                <div className="text-xs text-white-dark dark:text-gray-500">{dayjs(lastPaymentMade?.payment_date).format(' hh:mm a,  DD MM, YYYY.')}</div>
                                                <div className="text-xs text-white-dark dark:text-gray-500">
                                                    <em>for</em> {lastPaymentMade?.group?.name}
                                                </div>
                                                <div className="text-xs text-white-dark dark:text-gray-500">
                                                    <em>with</em> {lastPaymentMade?.payment_method?.name}
                                                </div>
                                            </div>
                                            <span className=" text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre">{renderStatus(lastPaymentMade?.status)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="panel  p-0 border-0 overflow-hidden justify-end items-end col-span-1">
                            <div className="p-5">
                                <div className="mb-5">
                                    <span className="bg-[#1b2e4b] text-white text-xs rounded-full px-4 py-1.5 before:bg-white before:w-1.5 before:h-1.5 before:rounded-full ltr:before:mr-2 rtl:before:ml-2 before:inline-block">
                                        Next Due Payment
                                    </span>
                                </div>
                                <div className="mb-5 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[#515365] font-semibold">Group</p>
                                        <p className="text-base">
                                            <span className="font-semibold">Alumni Group D</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[#515365] font-semibold">Amount</p>
                                        <p className="text-base">
                                            <span>GHC</span> <span className="font-semibold ">15.66</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-center px-2 flex justify-around">
                                    <button type="button" className="btn btn-secondary ltr:mr-2 rtl:ml-2">
                                        View Details
                                    </button>
                                    <button type="button" className="btn btn-success">
                                        Pay <b className="text-base ml-1 mr-1"> Ghc 15.66</b> Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="flex items-center justify-between mb-5">
                            <h5 className="font-semibold text-lg dark:text-white-light">Outstanding Payments</h5>
                        </div>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="ltr:rounded-l-md rtl:rounded-r-md">Customer</th>
                                        <th>Group Name</th>
                                        <th>Invoice</th>
                                        <th>Amount GHC</th>
                                        <th>Due Date</th>

                                        <th className="ltr:rounded-r-md rtl:rounded-l-md">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                        <td className="min-w-[150px] text-black dark:text-white">
                                            <div className="flex items-center">
                                                <img className="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src="/assets/images/profile-6.jpeg" alt="avatar" />
                                                <span className="whitespace-nowrap">Luke Ivory</span>
                                            </div>
                                        </td>
                                        <td className="text-primary ">Headphone</td>
                                        <td>
                                            <Link to="/apps/invoice/preview">#46894</Link>
                                        </td>
                                        <td>567.00</td>
                                        <td>GHC 56.07</td>

                                        <td className="flex gap-2">
                                            <Tippy content="View Details">
                                                <button type="button">
                                                    <IconEye className="m-auto" />
                                                </button>
                                            </Tippy>
                                            <Tippy content={overdue ? 'Pay Now' : 'Bill Overdue Pay Now'}>
                                                <button type="button" className={`btn ${overdue ? 'btn-success' : 'btn-danger'} text-white rounded-xl px-2 py-1 gap-1`}>
                                                    <FontAwesomeIcon icon={faUnlockAlt} />
                                                    pay
                                                </button>
                                            </Tippy>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="panel h-full  sm:col-span-3 xl:col-span-1 mt-5">
                    <div className="flex items-center justify-between dark:text-white-light mb-5">
                        <h5 className="font-semibold text-lg">Payments</h5>
                    </div>
                    <div className="space-y-3">
                        {sortedPaymentsByDate?.map((payment: any, index: number) => (
                            <div key={index} className="space-y-6">
                                <div className="flex panel">
                                    <span
                                        className={`shrink-0 grid place-content-center text-base w-9 h-9 rounded-md bg-${
                                            payment?.status === 'COMPLETED' ? 'green-50' : payment?.status === 'PENDING' ? 'yellow-50' : 'red-50'
                                        } text-${payment?.status === 'COMPLETED' ? 'success' : payment?.status === 'PENDING' ? 'info' : 'danger'} dark:text-success-light`}
                                    >
                                        {<IconCashBanknotes />}
                                    </span>
                                    <div className="px-3 flex-1">
                                        <span
                                            className={`text-${
                                                payment?.status === 'COMPLETED' ? 'success' : payment?.status === 'PENDING' ? 'info' : 'danger'
                                            } text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre`}
                                        >
                                            {Ghc(payment?.amount)}
                                        </span>
                                        <div className="text-xs text-white-dark dark:text-gray-500">{dayjs(payment?.payment_date).format(' hh:mm a,  DD MM, YYYY.')}</div>
                                        <div className="text-xs text-white-dark dark:text-gray-500">
                                            <em>for</em> {payment?.group?.name}
                                        </div>
                                        <div className="text-xs text-white-dark dark:text-gray-500">
                                            <em>with</em> {payment?.payment_method?.name}
                                        </div>
                                    </div>
                                    <span className=" text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre">{renderStatus(payment?.status)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <MakePaymentModal isPaymentModalOpened={isPaymentModalOpened} setIsPaymentModalOpened={setIsPaymentModalOpened} paymentData={paymentData} />
        </div>
    );
};

export default MyPayments;
