// import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
// import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { User, UsersPagination } from '@/types/user';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
import { FaEdit, FaEye } from "react-icons/fa";
import { MoreVertical, Plus } from 'lucide-react';
import { FiTrash2 } from 'react-icons/fi';
import { GiPadlockOpen } from "react-icons/gi";
import Pagination from '@/components/ui/pagination';
import { Switch } from '@/components/ui/switch';
import ImagePreview from '@/components/ui/image-preview';
import UserInfoModal from './show';
import EditPasswordModal from './EditPasswordModal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

export default function Index() {
    const { users } = usePage().props as unknown as {
        users: UsersPagination;
    };
    const { flash } = usePage<{ flash: { message?: string; error?: string; } }>().props;

    const [openInfo, setOpenInfo] = useState(false);
    const [selectedInfoUserId, setSelectedInfoUserId] = useState<number | null>(null);

    const [openEditPassword, setOpenEditPassword] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.message, flash?.error]);

    // Verificamos si `users` existe para evitar errores
    if (!users) {
        return <div>Loading...</div>;
    }
    //Cambio de estado
    function toggleStatus(userId: number, status: boolean) {
        router.put(`/users/${userId}/status`, { status: status ? 1 : 0 }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Estado actualizado'),
            onError: (errors: Record<string, string>) => {
                if (errors.error) toast.error(errors.error);
                else toast.error('No se pudo actualizar el estado');
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
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
                                <Link href="/users/create" prefetch className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nuevo usuario
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
                                        <TableHead>Imagen</TableHead>
                                        {/* {can.updateStatus && ( */}
                                            <TableHead>Estado</TableHead>
                                        {/* )} */}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length > 0 ? (
                                        users.data.map((user: User, index: number) => (
                                            <TableRow key={user.id}>
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
                                                                    <Link href={`/users/${user.id}/edit`} prefetch className="flex justify-center w-full">
                                                                        <FaEdit className="text-blue-500" />
                                                                        Editar
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            {/* )} */}
                                                            {/* {can.edit && ( */}
                                                            <DropdownMenuItem
                                                                onSelect={() => {
                                                                    setSelectedInfoUserId(user.id);
                                                                    setOpenInfo(true);
                                                                }}
                                                                className="p-2 flex justify-center"
                                                            >
                                                                <FaEye className="text-green-600" />
                                                                Ver detalles
                                                            </DropdownMenuItem>
                                                            {/* )} */}
                                                            {/* {can.updatePassword && ( */}
                                                                <DropdownMenuItem
                                                                    onSelect={() => {
                                                                        setSelectedUserId(user.id);
                                                                        setOpenEditPassword(true);
                                                                    }}
                                                                    className="p-2 flex justify-center"
                                                                >
                                                                    <GiPadlockOpen className="text-yellow-600" />
                                                                    Reset password
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
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <ImagePreview src={user.image} alt={user.name} imageName={user.name} />
                                                </TableCell>
                                                {/* {can.updateStatus && ( */}
                                                    <TableCell>
                                                        <Switch
                                                            checked={user.status}
                                                            onCheckedChange={(value) => toggleStatus(user.id, value)}
                                                            className={user.status ? 'bg-green-500' : 'bg-red-500'}
                                                        />
                                                    </TableCell>
                                                {/* )} */}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    {/* Paginación */}
                    <Pagination links={users.links} /> {/* Usamos el componente de paginación */}
                </div>
            </div>
            {/* Modal de info de usuario */}
            {openInfo && selectedInfoUserId !== null && (
                <UserInfoModal
                    key={selectedInfoUserId}
                    open={openInfo}
                    setOpen={(open) => {
                        setOpenInfo(open);
                        if (!open) setSelectedInfoUserId(null);
                    }}
                    userId={selectedInfoUserId}
                />
            )}
            {/* Modal de edición de contraseña */}
            {openEditPassword && selectedUserId !== null && (          // solo se monta si está abierto
                <EditPasswordModal
                    key={selectedUserId}            // fuerza nuevo montaje por id
                    open={openEditPassword}
                    setOpen={(open) => {
                        setOpenEditPassword(open);    // actualiza open
                        if (!open) setSelectedUserId(null); // limpia id → se desmonta
                    }}
                    userId={selectedUserId}
                    userEmail={users.data.find(u => u.id === selectedUserId)?.email}
                />
            )}
        </AppLayout>
    )
}
