export interface Supplier {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;

};
export type CreateSupplierProps = {
    supplierData: Supplier;
};

export interface CreateSupplierFormData {
    name: string;
    email: string;
    phone: string;
    address: string;


    [key: string]: string | null;
}

export interface EditSupplierFormData {
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

export interface SuppliersPagination {
    data: Supplier[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}
