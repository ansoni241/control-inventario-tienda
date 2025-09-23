import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
import { Rol, RolesPagination } from '@/types/rol';
import PermissionsList from '@/components/ui/permissions-list';
// import { Inertia } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

export default function Index() {
    const { roles } = usePage().props as unknown as {
        roles: RolesPagination;
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

    // Verificamos si `roles` existe para evitar errores
    if (!roles) {
        return <div>Loading...</div>;
    }
    //delete post method
    function deletePost(id: number) {
        if (confirm('¿Estás seguro de que quieres eliminar este rol?')) {
            router.delete(`/roles/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
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
                            <Link href="/roles/create" prefetch className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Nuevo rol
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
                                        <TableHead>Permisos</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.data.length > 0 ? (
                                        roles.data.map((rol: Rol, index: number) => (
                                            <TableRow key={rol.id}>
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
                                                                <Link href={`/roles/${rol.id}/edit`} prefetch className="flex justify-center w-full">
                                                                    <FaEdit className="text-blue-500" />
                                                                    Editar
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {/* )} */}
                                                            {/* {can.delete && ( */}
                                                            {/* <DropdownMenuItem
                                                                // onClick={() => deletePost(user.id)}
                                                                className="p-2 flex justify-center text-red-600"
                                                            >
                                                                <FiTrash2 color="#ff0000" />
                                                                Delete
                                                            </DropdownMenuItem> */}
                                                            <DropdownMenuItem
                                                                onSelect={() => deletePost(rol.id)}
                                                                className="p-2 flex justify-center text-red-600"
                                                            >
                                                                <FiTrash2 color="#ff0000" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                            {/* )} */}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                                <TableCell>{rol.name}</TableCell>
                                                <TableCell>
                                                    {/* {renderPermissions(rol.permissions)} */}
                                                    <PermissionsList permissions={rol.permissions} limit={3} />
                                                </TableCell>
                                                {/* )} */}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No roles found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    {/* Paginación */}
                    <Pagination links={roles.links} /> {/* Usamos el componente de paginación */}
                </div>
            </div>
        </AppLayout>
    )
}
