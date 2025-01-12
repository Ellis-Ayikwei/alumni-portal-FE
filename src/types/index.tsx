export interface Insurance {
    id?: string;
    name: string;
    description: string;
    sum_assured: number;
    monthly_premium_ghs: number;
    annual_premium_ghs: number;
    is_active: boolean;
    benefits: Benefit[];
}


interface Benefit {
    name: string;
    id: string;
    premium_payable: number;
}

export interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> {}


export type Permission = {
        id: string;
        name: string;
        resource_type: string;
        action: string;
        description: string;
        users: Array<{}>
    };

export type PermissionsResponse = {
        resource_type: string;
        permissions: Permission[];
    }[];
