import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
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
import Pagination from '@/components/ui/pagination';
import { Sale, SalesPagination } from '@/types/sale';
import SaleInfoModal from '@/components/ui/sale-info-modal';
import SalePaymentModal from '@/components/ui/sale-payment-modal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ventas', href: '/sales' },
];

export default function Index() {
    const { sales, can } = usePage().props as unknown as {
        sales: SalesPagination;
        can: {
            create: boolean;
            show: boolean;
            edit: boolean;
            delete: boolean;
        };
    };
    const { flash } = usePage<{ flash: { message?: string; error?: string; } }>().props;

    const [openInfo, setOpenInfo] = useState(false);
    const [selectedInfoSaleId, setSelectedInfoSaleId] = useState<number | null>(null);

    const [openPayment, setOpenPayment] = useState(false);
    const [selectedPaymentSaleId, setSelectedPaymentSaleId] = useState<number | null>(null);


    useEffect(() => {
        if (flash?.message) toast.success(flash.message);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.message, flash?.error]);

    if (!sales) return <div>Loading...</div>;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ventas" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className='rounded border p-6 shadow-xl'>
                    <div className='flex items-center justify-between mb-5'>
                        {can.create && (
                            <Button>
                                <Link href="/sales/create" prefetch className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nueva venta
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
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Registrado por</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Pagado</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales.data.length > 0 ? (
                                        sales.data.map((sale: Sale, index: number) => (
                                            <TableRow key={sale.id}>
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
                                                                        setSelectedInfoSaleId(sale.id);
                                                                        setOpenInfo(true);
                                                                    }}
                                                                    className="p-2 flex justify-center"
                                                                >
                                                                    <FaEye className="text-green-600" />
                                                                    Ver detalles
                                                                </DropdownMenuItem>
                                                            )}
                                                            {can.edit && (
                                                                <DropdownMenuItem
                                                                    onSelect={() => {
                                                                        setSelectedPaymentSaleId(sale.id);
                                                                        setOpenPayment(true);
                                                                    }}
                                                                    className="p-2 flex justify-center"
                                                                >
                                                                    💰 Registrar pago
                                                                </DropdownMenuItem>
                                                            )}
                                                            {can.edit && (
                                                                <DropdownMenuItem asChild className="p-2">
                                                                    <Link href={`/sales/${sale.id}/edit`} prefetch className="flex justify-center w-full">
                                                                        <FaEdit className="text-blue-500" />
                                                                        Editar
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                                <TableCell>{sale.customer?.name ?? '—'}</TableCell>
                                                <TableCell>{sale.user?.name ?? '—'}</TableCell>
                                                <TableCell>{new Date(sale.date).toISOString().split('T')[0]}</TableCell>
                                                <TableCell>{sale.total.toFixed(2)}</TableCell>
                                                <TableCell>{sale.payments_sum_amount?.toFixed(2) ?? '0.00'}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-semibold ${sale.status === 'pagado' ? 'bg-green-100 text-green-700'
                                                            : sale.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {sale.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                                                No hay ventas registradas.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Pagination links={sales.links} />
                </div>
            </div>

            {/* Modal de info de Venta */}
            {openInfo && selectedInfoSaleId !== null && (
                <SaleInfoModal
                    key={selectedInfoSaleId}
                    open={openInfo}
                    setOpen={(open) => {
                        setOpenInfo(open);
                        if (!open) setSelectedInfoSaleId(null);
                    }}
                    saledId={selectedInfoSaleId}
                />
            )}
            {/* Modal de pagos */}
            {openPayment && selectedPaymentSaleId !== null && (
                <SalePaymentModal
                    open={openPayment}
                    setOpen={setOpenPayment}
                    saleId={selectedPaymentSaleId}
                    onPaymentSuccess={() => router.reload()}
                />
            )}

        </AppLayout>
    );
}
