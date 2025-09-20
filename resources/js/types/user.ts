export interface User {
    id: number;
    name: string;
    email: string;

    image: string | null;
    phone: string;
    address: string;
    city: string;
    role: string;

    status: boolean;
};

export type Role = {
    id: number;
    name: string;
};

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
};

export interface UsersPagination {
    data: User[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
};

export type CreateUserProps = {
    userData: User;
    roles: Role[];
};
export interface CreateUserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    image: File | null;
    phone: string;
    address: string;
    city: string;
    status: boolean;
    role: string;

    [key: string]: string | File | boolean | null;
}

export interface EditUserFormData {
    name: string;
    email: string;
    image: File | null;
    phone: string;
    address: string;
    city: string;
    role: string;

    [key: string]: string | File | boolean | null;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  image: string | null;
  phone?: string;
  address?: string;
  city?: string;
  role?: string;
  status: boolean;
  roles?: Role[];
}
