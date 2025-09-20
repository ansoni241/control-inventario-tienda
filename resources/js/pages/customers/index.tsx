
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { FaEdit } from "react-icons/fa";
import { MoreVertical, Plus } from 'lucide-react';
import { FiTrash2 } from 'react-icons/fi';
import Pagination from '@/components/ui/pagination';
import { Customer, CustomersPagination } from '@/types/customer';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clientes',
        href: '/customers',
    },
];

export default function Index() {
    const { customers } = usePage().props as unknown as {
        customers: CustomersPagination;
    };
    const { flash } = usePage<{ flash: { message?: string; error?: string; } }>().props;


    useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.message, flash?.error]);

    // Verificamos si `users` existe para evitar errores
    if (!customers) {
        return <div>Loading...</div>;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className='rounded border p-6 shadow-xl'>
                    <div className='flex items-center justify-between mb-5'>
                        {/* <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                name="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or email"
                                className="pl-10 pr-8"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-600 text-xl leading-none focus:outline-none"
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div> */}
                        {/* {can.create && ( */}
                            <Button>
                                <Link href="/customers/create" prefetch className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nuevo cliente
                                </Link>
                            </Button>
                        {/* )} */}
                    </div>
                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Opciones</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Celular</TableHead>
                                        <TableHead>Dirección</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.data.length > 0 ? (
                                        customers.data.map((customer: Customer, index: number) => (
                                            <TableRow key={customer.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className='space-x-1'>
                                                    <DropdownMenu modal={false}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-auto p-1">
                                                            {/* {can.edit && ( */}
                                                                <DropdownMenuItem asChild className="p-2">
                                                                    <Link href={`/customers/${customer.id}/edit`} prefetch className="flex justify-center w-full">
                                                                        <FaEdit className="text-blue-500" />
                                                                        Editar
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            {/* )} */}
                                                            {/* {can.delete && ( */}
                                                                <DropdownMenuItem
                                                                    // onClick={() => deletePost(user.id)}
                                                                    className="p-2 flex justify-center text-red-600"
                                                                >
                                                                    <FiTrash2 color="#ff0000" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            {/* )} */}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                                <TableCell>{customer.name}</TableCell>
                                                <TableCell>{customer.email}</TableCell>
                                                <TableCell>{customer.phone}</TableCell>
                                                <TableCell>{customer.address}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No clientes found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    {/* Paginación */}
                    <Pagination links={customers.links} /> {/* Usamos el componente de paginación */}
                </div>
            </div>
        </AppLayout>
    )
}
