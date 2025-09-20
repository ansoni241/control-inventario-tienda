import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';

import { PaginatedResponse } from '@/types/pagination';
import { Search, X } from 'lucide-react'; // 👈 íconos

// Tipo del detalle de ventas
export interface SaleDetail {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
    sale_date: string;
    customer_name: string;
}

interface Props {
    details: PaginatedResponse<SaleDetail>;
    filters: { from?: string; to?: string };
    flash?: { message?: string; error?: string };
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ventas', href: '/sales' },
    { title: 'Reporte', href: '/sales/report' },
];

export default function Index() {
    const { details, filters, flash } = usePage<Props>().props;

    const [from, setFrom] = useState(filters?.from || '');
    const [to, setTo] = useState(filters?.to || '');

    useEffect(() => {
        if (flash?.message) toast.success(flash.message);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    if (!details) return <div>Loading...</div>;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte de Ventas" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    {/* Filtros con íconos */}
                    <div className="flex items-center justify-between mb-5 gap-2">
                        <Input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                        <Input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                        <Button asChild variant="outline" size="sm" title="Filtrar">
                            <Link href={`/reportsales?from=${from}&to=${to}`} preserveScroll>
                                <Search className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" title="Limpiar">
                            <Link href="/reportsales" preserveScroll>
                                <X className="h-4 w-4" />
                            </Link>
                        </Button>
                        {/* Botón Excel */}
                        <Button variant="outline" size="sm" title="Exportar Excel" asChild>
                            <a
                                href={`/reportsales/export?from=${from}&to=${to}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                download="ventas.xlsx"
                            >
                                📥
                            </a>
                        </Button>
                    </div>

                    {/* Tabla */}
                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>Precio</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {details.data.length > 0 ? (
                                        details.data.map((detail, index) => (
                                            <TableRow key={detail.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{detail.sale_date}</TableCell>
                                                <TableCell>{detail.customer_name}</TableCell>
                                                <TableCell>{detail.product_name}</TableCell>
                                                <TableCell className="text-center">{detail.quantity}</TableCell>
                                                <TableCell className="text-center">{detail.price}</TableCell>
                                                <TableCell className="text-center font-semibold">{detail.subtotal}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                No hay ventas en el rango de fechas seleccionado.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Paginación */}
                    <Pagination links={details.links} />
                </div>
            </div>
        </AppLayout>
    );
}
