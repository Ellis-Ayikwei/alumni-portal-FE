'use client';
// 👆 Since 'useContextMenu' is a hook, don't forget to add the 'use client' directive
//    at the top of your file if you're using it in a RSC context

import { useMediaQuery } from '@mantine/hooks';
import { useContextMenu } from 'mantine-contextmenu';
import { DataTable } from 'mantine-datatable';
import { showNotification } from '@mantine/notifications';
import IconEdit from '../../components/Icon/IconEdit';
import IconEye from '../../components/Icon/IconEye';
import IconTrash from '../../components/Icon/IconTrash';

const companies = [
    {
        name: 'Feest, Bogan and Herzog',
        streetAddress: '21716 Ratke Drive',
        city: 'Stromanport',
        state: 'WY',
    },
    {
        name: 'Cummerata - Kuhlman',
        streetAddress: '6389 Dicki Stream',
        city: 'South Gate',
        state: 'NH',
    },
    {
        name: 'Goyette Inc',
        streetAddress: '8873 Mertz Rapid',
        city: 'Dorthyside',
        state: 'ID',
    },
    {
        name: 'Runte Inc',
        streetAddress: '2996 Ronny Mount',
        city: 'McAllen',
        state: 'MA',
    },
    {
        name: 'Goldner, Rohan and Lehner',
        streetAddress: '632 Broadway Avenue',
        city: 'North Louie',
        state: 'WY',
    },
    {
        name: "Doyle, Hodkiewicz and O'Connell",
        streetAddress: '576 Joyce Ways',
        city: 'Tyraburgh',
        state: 'KS',
    },
    {
        name: "Rau - O'Hara",
        streetAddress: '7508 Lansdowne Road',
        city: 'Shieldsborough',
        state: 'MI',
    },
    {
        name: 'Tillman - Jacobi',
        streetAddress: '57918 Gwendolyn Circles',
        city: 'Sheridanport',
        state: 'MI',
    },
    {
        name: 'Connelly, Feest and Hodkiewicz',
        streetAddress: '7057 Stanley Road',
        city: 'Kearaburgh',
        state: 'CA',
    },
    {
        name: 'Shanahan, Robel and Beier',
        streetAddress: '378 Berta Crescent',
        city: 'West Gerry',
        state: 'KS',
    },
    {
        name: 'Kling - McLaughlin',
        streetAddress: '8346 Kertzmann Square',
        city: 'South Joesph',
        state: 'ID',
    },
    {
        name: 'Jogi - McLaughlin',
        streetAddress: '83462 Shazam Street',
        city: 'North Joesph',
        state: 'ID',
    },
    {
        name: 'Jogi - McLaughlin',
        streetAddress: '83462 Shazam Street',
        city: 'North Joesph',
        state: 'ID',
    },
];

export function RowContextMenuExample() {
    const { showContextMenu } = useContextMenu();
    const isTouch = useMediaQuery('(pointer: coarse)');

    return (
        <DataTable
            withTableBorder
            withColumnBorders
            textSelectionDisabled={isTouch} // 👈 disable text selection on touch devices
            columns={[{ accessor: 'name' }, { accessor: 'streetAddress' }, { accessor: 'city' }, { accessor: 'state' }]}
            records={companies}
            onRowContextMenu={({ record, event }) =>
                showContextMenu([
                    {
                        key: 'view-company-details',
                        icon: <IconEye />,
                        onClick: () =>
                            showNotification({
                                message: `Clicked on view context-menu action for ${record.name} company`,
                                withBorder: true,
                            }),
                    },
                    {
                        key: 'edit-company-information',
                        icon: <IconEdit />,
                        onClick: () =>
                            showNotification({
                                message: `Clicked on edit context-menu action for ${record.name} company`,
                                withBorder: true,
                            }),
                    },
                    { key: 'divider' },
                    {
                        key: 'delete-company',
                        icon: <IconTrash />,
                        color: 'red',
                        onClick: () =>
                            showNotification({
                                color: 'red',
                                message: `Clicked on delete context-menu action for ${record.name} company`,
                                withBorder: true,
                            }),
                    },
                ])(event)
            }
        />
    );
}
