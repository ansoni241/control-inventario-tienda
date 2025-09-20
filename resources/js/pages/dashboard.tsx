
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface SummaryData {
    totalSales: number;
    totalPurchases: number;
    customers: number;
    suppliers: number;
}

interface ProductSales {
    product_name: string;
    quantity: number;
}

interface ProductStock {
    id: number;
    name: string;
    stock: number;
}

export default function Dashboard() {
    const [summary, setSummary] = useState<SummaryData>({
        totalSales: 0,
        totalPurchases: 0,
        customers: 0,
        suppliers: 0,
    });

    const [yearlySales, setYearlySales] = useState<ProductSales[]>([]);
    const [monthlySales, setMonthlySales] = useState<ProductSales[]>([]);
    const [dailySales, setDailySales] = useState<ProductSales[]>([]);
    const [lowStock, setLowStock] = useState<ProductStock[]>([]);

    useEffect(() => {
        axios.get('/dashboard/data')
            .then(({ data }) => {
                setSummary(prev => data.summary ?? prev);
                setYearlySales(data.yearlySales ?? []);
                setMonthlySales(data.monthlySales ?? []);
                setDailySales(data.dailySales ?? []);
                setLowStock(data.lowStock ?? []);
            })
            .catch(err => {
                console.error('Error cargando datos del dashboard:', err);
            });
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">

                {/* --- Cuadros de resumen --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-300 shadow-lg text-white rounded-lg">
                        <CardContent>
                            <h3 className="text-lg font-semibold">Total Ventas</h3>
                            <p className="text-2xl font-bold">{summary.totalSales.toFixed(2)} Bs.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-green-500 to-green-300 shadow-lg text-white rounded-lg">
                        <CardContent>
                            <h3 className="text-lg font-semibold">Total Compras</h3>
                            <p className="text-2xl font-bold">{summary.totalPurchases.toFixed(2)} Bs.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-yellow-400 to-yellow-200 shadow-lg text-white rounded-lg">
                        <CardContent>
                            <h3 className="text-lg font-semibold">Clientes</h3>
                            <p className="text-2xl font-bold">{summary.customers}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-red-500 to-red-300 shadow-lg text-white rounded-lg">
                        <CardContent>
                            <h3 className="text-lg font-semibold">Proveedores</h3>
                            <p className="text-2xl font-bold">{summary.suppliers}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* --- Gráficos de barras (columna) --- */}
                <div className="flex flex-col gap-4">
                    <Card>
                        <CardContent>
                            <h3 className="text-lg font-bold mb-2">Productos más vendidos (Año)</h3>
                            {yearlySales.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={yearlySales}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="product_name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="quantity" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-gray-500">No hay ventas en el año.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <h3 className="text-lg font-bold mb-2">Productos más vendidos (Mes)</h3>
                            {monthlySales.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={monthlySales}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="product_name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="quantity" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-gray-500">No hay ventas en el mes.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <h3 className="text-lg font-bold mb-2">Productos más vendidos (Hoy)</h3>
                            {dailySales.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={dailySales}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="product_name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="quantity" fill="#f59e0b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-gray-500">No hay ventas hoy.</p>}
                        </CardContent>
                    </Card>
                </div>

                {/* --- Productos con bajo stock --- */}
                <Card className="mt-4 shadow-lg rounded-lg">
                    <CardContent>
                        <h3 className="text-lg font-bold mb-2">Productos con bajo stock</h3>
                        {lowStock.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {lowStock.map(p => (
                                    <li key={p.id} className="flex justify-between py-2">
                                        <span>{p.name}</span>
                                        <span className={`px-2 py-1 rounded ${p.stock <= 5 ? 'bg-red-500 text-white' : 'bg-yellow-300 text-black'}`}>
                                            {p.stock}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-400">No hay productos con bajo stock.</p>}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
