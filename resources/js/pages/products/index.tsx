
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
import { Product, ProductsPagination } from '@/types/product';
import { DescriptionCell } from '@/components/ui/description-cell';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos',
        href: '/products',
    },
];

export default function Index() {
    const { products, can } = usePage().props as unknown as {
        products: ProductsPagination;
        can: {
            create: boolean;
            edit: boolean;
            delete: boolean;
        };
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
    if (!products) {
        return <div>Loading...</div>;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />
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
                            <Link href="/products/create" prefetch className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Nuevo producto
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
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Precio compra</TableHead>
                                        <TableHead>Precio venta</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Proveedor</TableHead>
                                        <TableHead>Descripción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.data.length > 0 ? (
                                        products.data.map((product: Product, index: number) => (
                                            <TableRow key={product.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className='space-x-1'>
                                                    <DropdownMenu modal={false}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-auto p-1">
                                                            {can.edit && (
                                                            <DropdownMenuItem asChild className="p-2">
                                                                <Link href={`/products/${product.id}/edit`} prefetch className="flex justify-center w-full">
                                                                    <FaEdit className="text-blue-500" />
                                                                    Editar
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            )}
                                                            {can.delete && (
                                                            <DropdownMenuItem
                                                                // onClick={() => deletePost(user.id)}
                                                                className="p-2 flex justify-center text-red-600"
                                                            >
                                                                <FiTrash2 color="#ff0000" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell
                                                    className={`text-center font-semibold text-white ${product.stock < 10 ? 'bg-red-500' : 'bg-green-500'
                                                        }`}
                                                >
                                                    {product.stock}
                                                </TableCell>
                                                <TableCell
                                                    className='text-center'
                                                >
                                                    {product.purchase_price}
                                                </TableCell>
                                                <TableCell
                                                    className='text-center'
                                                >
                                                    {product.sale_price}
                                                </TableCell>
                                                <TableCell
                                                    className={product.status === 'activo' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}
                                                >
                                                    {product.status}
                                                </TableCell>
                                                <TableCell>{product.category_id}</TableCell>
                                                <TableCell>{product.supplier_id}</TableCell>
                                                <TableCell>
                                                    {/* {product.description} */}
                                                    <DescriptionCell text={product.description} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No productos found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    {/* Paginación */}
                    <Pagination links={products.links} /> {/* Usamos el componente de paginación */}
                </div>
            </div>
        </AppLayout>
    )
}
