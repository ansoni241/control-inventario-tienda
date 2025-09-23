export interface Permission {
    id: number;
    name: string;
}

export interface Rol {
    id: number;
    name: string;
    permissions: Permission[];

}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface RolesPagination {
    data: Rol[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}
