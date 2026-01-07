
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
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
import Pagination from '@/components/ui/pagination';
import { Purchase, PurchasesPagination } from '@/types/purchase';
import PurchaseInfoModal from '@/components/ui/purchase-info-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Compras',
        href: '/purchases',
    },
];

export default function Index() {
    const { purchases, can } = usePage().props as unknown as {
        purchases: PurchasesPagination;
        can: {
            create: boolean;
            show: boolean;
            edit: boolean;
            delete: boolean;
        };
    };
    const { flash } = usePage<{ flash: { message?: string; error?: string; } }>().props;
    const [openInfo, setOpenInfo] = useState(false);
    const [selectedInfoPurchaseId, setSelectedInfoPurchaseId] = useState<number | null>(null);


    useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.message, flash?.error]);

    // Verificamos si `users` existe para evitar errores
    if (!purchases) {
        return <div>Loading...</div>;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compra" />
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
                        {can.create && (
                        <Button>
                            <Link href="/purchases/create" prefetch className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Nueva compra
                            </Link>
                        </Button>
                        )}
                    </div>
                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Opciones</TableHead>
                                        <TableHead>Proveedor</TableHead>
                                        <TableHead>Compra por</TableHead>
                                        <TableHead># factura</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Nota</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchases.data.length > 0 ? (
                                        purchases.data.map((purchase: Purchase, index: number) => (
                                            <TableRow key={purchase.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className='space-x-1'>
                                                    <DropdownMenu modal={false}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-auto p-1">
                                                            {can.show && (
                                                            <DropdownMenuItem
                                                                onSelect={() => {
                                                                    setSelectedInfoPurchaseId(purchase.id);
                                                                    setOpenInfo(true);
                                                                }}
                                                                className="p-2 flex justify-center"
                                                            >
                                                                <FaEye className="text-green-600" />
                                                                Ver detalles
                                                            </DropdownMenuItem>
                                                            )}
                                                            {can.edit && (
                                                            <DropdownMenuItem asChild className="p-2">
                                                                <Link href={`/purchases/${purchase.id}/edit`} prefetch className="flex justify-center w-full">
                                                                    <FaEdit className="text-blue-500" />
                                                                    Editar
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                                <TableCell>{purchase.supplier_id}</TableCell>
                                                <TableCell>{purchase.user_id}</TableCell>
                                                <TableCell>{purchase.invoice_number}</TableCell>
                                                <TableCell>{purchase.date}</TableCell>
                                                <TableCell>{purchase.total}</TableCell>
                                                <TableCell>{purchase.notes}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No compras found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    {/* Paginación */}
                    <Pagination links={purchases.links} /> {/* Usamos el componente de paginación */}
                </div>
            </div>
            {/* Modal de info de Compra */}
            <div className="relative overflow-x-hidden">
                {openInfo && selectedInfoPurchaseId !== null && (
                    <PurchaseInfoModal
                        key={selectedInfoPurchaseId}
                        open={openInfo}
                        setOpen={(open) => {
                            setOpenInfo(open);
                            if (!open) setSelectedInfoPurchaseId(null);
                        }}
                        purchaseId={selectedInfoPurchaseId}
                    />
                )}
            </div>
        </AppLayout>
    )
}
