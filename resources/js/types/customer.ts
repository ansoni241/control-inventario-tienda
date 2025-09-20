export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;

};
export type CreateCustomerProps = {
    customerData: Customer;
};

export interface CreateCustomerFormData {
    name: string;
    email: string;
    phone: string;
    address: string;


    [key: string]: string | null;
}

export interface EditCustomerFormData {
    name: string;
    email: string;
    phone: string;
    address: string;

    [key: string]: string | null;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface CustomersPagination {
    data: Customer[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}
