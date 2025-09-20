import { Product } from "./product";
import { Supplier } from "./supplier";

export interface Purchase {
    id: number;
    supplier_id: number | null;
    user_id: number;
    // invoice_number: number;
    invoice_number: string | null;
    date: string;
    total: number;
    notes: string;
}

export type CreatePurchaseProps = {
    purchaseData: Purchase;
    suppliers: Supplier[];
    products: Product[];
};

export interface PurchaseItem {
    product_id: number| null;
    // product_id: number | null;
    quantity: number | string;
    unit_price: number | string;
}

// interface CreatePurchaseFormData {
//     supplier_id: string;
//     purchase_date: string;
//     invoice_number: string;
//     notes: string;
//     items: PurchaseItem[];
// }

export interface CreatePurchaseFormData {
    supplier_id: number | null;
    date: string;

    invoice_number: string | null;
    notes: string | null;

    items: PurchaseItem[];


    // [key: string]: string | number | null;
    // [key: string]: unknown;
}

export interface EditPurchaseFormData {
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

export interface PurchasesPagination {
    data: Purchase[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}
