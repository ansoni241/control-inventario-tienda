import { Customer } from "./customer";
import { Product } from "./product";

export interface Sale {
    id: number;
    customer_id: number | null;
    user_id: number;
    date: string;
    total: number;
    status: 'pendiente' | 'pagado' | 'cancelado';

    customer?: {
        id: number;
        name: string;
    } | null;

    user?: {
        id: number;
        name: string;
    };

    // Campo calculado desde withSum('payments', 'amount')
    payments_sum_amount?: number;
}

export type CreateSaleProps = {
    saleData: Sale;
    customers: Customer[];
    products: Product[];
};

export interface SaleItem {
    product_id: number | null;
    quantity: number | string;
    unit_price: number | string;
}
export interface SalePayment {
    method: 'efectivo' | 'qr' | 'transferencia' | 'otros';
    amount: number | string;
}
export interface CreateSaleFormData {
    customer_id: number | null;
    date: string;
    status: 'pendiente' | 'pagado' | 'cancelado';
    items: SaleItem[];
    payments: SalePayment[]


    // [key: string]: string | number | null;
    // [key: string]: unknown;
}

export interface EditSaleFormData {
    supplier_id: number | null;
    // user_id: number;
    invoice_number: string | null;
    notes: string | null;
    date: string;
    // total: number;

    [key: string]: string | number | null;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface SalesPagination {
    data: Sale[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}
