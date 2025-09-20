import { Category } from "./category";
import { Supplier } from "./supplier";

export interface Product {
    id: number;
    category_id: number | null;
    supplier_id: number | null;
    name: string;
    description: string | null;
    stock: number;
    purchase_price: number;
    sale_price: number;
    status: 'activo' | 'inactivo';
}

export type CreateProductProps = {
    productData: Product;
    categories: Category[];
    suppliers: Supplier[];
};

export interface CreateProductFormData {
    category_id: number | null;
    supplier_id: number | null;
    name: string;
    description: string | null;
    stock: number;
    purchase_price: number;
    sale_price: number;
    status: 'activo' | 'inactivo';


    [key: string]: string | number | null | 'activo' | 'inactivo';
}

export interface EditProductFormData {
    category_id: number | null;
    supplier_id: number | null;
    name: string;
    description: string | null;
    stock: number;
    purchase_price: number;
    sale_price: number;
    status: 'activo' | 'inactivo';

    [key: string]: string | number | null | 'activo' | 'inactivo';
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface ProductsPagination {
    data: Product[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}
