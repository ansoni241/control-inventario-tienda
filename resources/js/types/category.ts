export interface Category {
    id: number;
    name: string;
    description: string;

};
export type CreateCategoryProps = {
    categoryData: Category;
};

export interface CreateCategoryFormData {
    name: string;
    description: string;


    [key: string]: string | null;
}

export interface EditCategoryFormData {
    name: string;
    description: string;

    [key: string]: string | null;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface CategoriesPagination {
    data: Category[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}
