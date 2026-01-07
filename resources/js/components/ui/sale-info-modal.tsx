
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
import { Trash2, X, Pencil } from "lucide-react";
import { router } from "@inertiajs/react";

interface SaleDetail {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface SalePayment {
    id: number;
    method: string;
    amount: number;
}

interface Sale {
    id: number;
    customer_name: string;
    user_name: string;
    date: string;
    total: number;
    paid: number;
    status: "pendiente" | "pagado" | "cancelado";
}

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    saledId: number;
}

export default function SaleInfoModal({ open, setOpen, saledId }: Props) {
    const [sale, setSale] = useState<Sale | null>(null);
    const [details, setDetails] = useState<SaleDetail[]>([]);
    const [payments, setPayments] = useState<SalePayment[]>([]);
    const [loading, setLoading] = useState(false);

    const [editRow, setEditRow] = useState<number | null>(null);
    const [tempDetail, setTempDetail] = useState<Partial<SaleDetail>>({});

    const [editPaymentRow, setEditPaymentRow] = useState<number | null>(null);
    const [tempPayment, setTempPayment] = useState<Partial<SalePayment>>({});

    const [confirmSave, setConfirmSave] = useState(false);
    const [confirmPaymentSave, setConfirmPaymentSave] = useState(false);

    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        axios.get(`/sales/${saledId}`)
            .then(({ data }) => {
                setSale(data.sale);
                setDetails(data.details);
                setPayments(data.payments);
            })
            .finally(() => setLoading(false));
    }, [open, saledId]);

    /** ----------------- PRODUCTOS ----------------- */
    const handleSaveDetail = () => setConfirmSave(true);
    const confirmSaveDetail = () => {
        if (!editRow) return;

        const payload = {
            quantity: tempDetail.quantity ?? 0,
            unit_price: tempDetail.unit_price ?? 0,
        };

        axios.put(`/sale-details/${editRow}`, payload)
            .then(({ data }) => {
                setDetails(prev => prev.map(d => d.id === editRow ? data.detail : d));
                if (sale) setSale({ ...sale, total: data.total });
                setEditRow(null);
                setTempDetail({});
                setHasChanges(true);
            })
            .finally(() => setConfirmSave(false));
    };

    const handleDeleteDetail = (detailId: number) => {
        if (!confirm("¿Estás seguro de eliminar este producto?")) return;
        if (details.length === 1 && !confirm("Este es el último producto. Se eliminará toda la venta. ¿Deseas continuar?")) return;

        axios.delete(`/sale-details/${detailId}`)
            .then(({ data }) => {
                setHasChanges(true);

                if (details.length === 1) {
                    setOpen(false);
                    router.reload();
                } else {
                    setDetails(prev => prev.filter(d => d.id !== detailId));
                    if (sale) setSale({ ...sale, total: data.total ?? 0 });
                }
            });
    };

    /** ----------------- PAGOS ----------------- */
    const handleSavePayment = () => setConfirmPaymentSave(true);
    const confirmSavePayment = () => {
        if (!editPaymentRow) return;

        const payload = {
            method: tempPayment.method ?? "",
            amount: tempPayment.amount ?? 0,
        };

        axios.put(`/sale-payments/${editPaymentRow}`, payload)
            .then(({ data }) => {
                setPayments(prev => prev.map(p => p.id === editPaymentRow ? data.payment : p));
                if (sale) setSale({ ...sale, paid: data.paid });
                setEditPaymentRow(null);
                setTempPayment({});
                setHasChanges(true);
            })
            .finally(() => setConfirmPaymentSave(false));
    };

    const handleDeletePayment = (paymentId: number) => {
        if (!confirm("¿Estás seguro de eliminar este pago?")) return;

        axios.delete(`/sale-payments/${paymentId}`)
            .then(({ data }) => {
                setPayments(prev => prev.filter(p => p.id !== paymentId));

                if (sale) {
                    setSale({
                        ...sale,
                        paid: data.paid,
                        status: data.status,
                    });
                }

                setHasChanges(true);
            });
    };

    /** ----------------- STATUS ----------------- */
    const handleStatusChange = (newStatus: Sale["status"]) => {
        if (!sale) return;
        if (newStatus === "cancelado") {
            if (!confirm("Al cancelar la venta se eliminarán todos los registros. ¿Deseas continuar?")) return;
        } else {
            if (!confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)) return;
        }

        axios.put(`/sales/${sale.id}/status`, { status: newStatus })
            .then(({ data }) => setSale(prev => prev ? { ...prev, status: data.status } : prev));
        setHasChanges(true);
    };

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        if (hasChanges) {
                            router.reload({ only: ['sales'] });
                        }
                        setOpen(false);
                    } else {
                        setOpen(true);
                    }
                }}
            >
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
                    <div className="overflow-y-auto px-4 py-2 flex-1 space-y-6">
                        <DialogHeader>
                            <DialogTitle>Detalles de la venta</DialogTitle>
                            <DialogDescription>Información completa de la venta y sus productos</DialogDescription>
                        </DialogHeader>

                        {loading && <p className="text-center py-6 text-gray-500">Cargando…</p>}

                        {sale && (
                            <>
                                {/* Encabezado */}
                                <div className="bg-gray-50 dark:bg-gray-700 border rounded-lg p-4 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">Venta #{sale.id}</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-white">
                                        <p><b>Cliente:</b> {sale.customer_name}</p>
                                        <p><b>Registrado por:</b> {sale.user_name}</p>
                                        <p><b>Fecha:</b> {sale.date}</p>
                                        <p>
                                            <b>Status:</b>{" "}
                                            <select
                                                value={sale.status}
                                                onChange={e => handleStatusChange(e.target.value as Sale["status"])}
                                                className="border dark:bg-black rounded px-2 py-1"
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="pagado">Pagado</option>
                                                <option value="cancelado">Cancelado</option>
                                            </select>
                                        </p>
                                        <p className="col-span-2 text-right text-lg font-semibold">
                                            Total: {Number(sale.total).toFixed(2)}
                                        </p>
                                        <p className="col-span-2 text-right text-lg font-semibold"
                                            style={{ color: sale.paid >= sale.total ? 'green' : 'red' }}>
                                            Pagado: {Number(sale.paid).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Productos */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800 mb-2 dark:text-white">Productos</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border text-sm text-gray-700 dark:text-white">
                                            <thead className="bg-gray-100 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Producto</th>
                                                    <th className="px-3 py-2 text-center">Cantidad</th>
                                                    <th className="px-3 py-2 text-center">Precio unitario</th>
                                                    <th className="px-3 py-2 text-center">Subtotal</th>
                                                    <th className="px-3 py-2 text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {details.map(detail => (
                                                    <tr key={detail.id} className="border-t">
                                                        <td className="px-3 py-2">{detail.product_name}</td>
                                                        <td className="px-3 py-2 text-center">
                                                            {editRow === detail.id ? (
                                                                <Input
                                                                    type="number"
                                                                    value={tempDetail.quantity ?? detail.quantity}
                                                                    onChange={e =>
                                                                        setTempDetail(d => ({ ...d, quantity: Number(e.target.value) }))
                                                                    }
                                                                />
                                                            ) : detail.quantity}
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            {editRow === detail.id ? (
                                                                <Input
                                                                    type="number"
                                                                    value={tempDetail.unit_price ?? detail.unit_price}
                                                                    onChange={e =>
                                                                        setTempDetail(d => ({ ...d, unit_price: Number(e.target.value) }))
                                                                    }
                                                                />
                                                            ) : Number(detail.unit_price).toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            {(editRow === detail.id
                                                                ? (tempDetail.quantity ?? detail.quantity) * (tempDetail.unit_price ?? detail.unit_price)
                                                                : detail.quantity * detail.unit_price
                                                            ).toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            {editRow === detail.id ? (
                                                                <div className="flex justify-center gap-2">
                                                                    <Button size="sm" className="bg-green-500 text-white" onClick={handleSaveDetail}>✅</Button>
                                                                    <Button size="sm" variant="outline" onClick={() => { setEditRow(null); setTempDetail({}); }}>
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex justify-center gap-2">
                                                                    <Button size="sm" variant="outline" onClick={() => { setEditRow(detail.id); setTempDetail({ quantity: detail.quantity, unit_price: detail.unit_price }); }}>
                                                                        <Pencil className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteDetail(detail.id)}>
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Pagos */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800 mb-2 dark:text-white">Pagos</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border text-sm text-gray-700 dark:text-white">
                                            <thead className="bg-gray-100 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Método</th>
                                                    <th className="px-3 py-2 text-center">Monto</th>
                                                    <th className="px-3 py-2 text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map(payment => (
                                                    <tr key={payment.id} className="border-t">
                                                        <td className="px-3 py-2">
                                                            {editPaymentRow === payment.id ? (
                                                                <Input
                                                                    type="text"
                                                                    value={tempPayment.method ?? payment.method}
                                                                    onChange={e => setTempPayment(p => ({ ...p, method: e.target.value }))}
                                                                />
                                                            ) : payment.method}
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            {editPaymentRow === payment.id ? (
                                                                <Input
                                                                    type="number"
                                                                    value={tempPayment.amount ?? payment.amount}
                                                                    onChange={e => setTempPayment(p => ({ ...p, amount: Number(e.target.value) }))}
                                                                />
                                                            ) : Number(payment.amount).toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            {editPaymentRow === payment.id ? (
                                                                <div className="flex justify-center gap-2">
                                                                    <Button size="sm" className="bg-green-500 text-white" onClick={handleSavePayment}>✅</Button>
                                                                    <Button size="sm" variant="outline" onClick={() => { setEditPaymentRow(null); setTempPayment({}); }}>
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex justify-center gap-2">
                                                                    <Button size="sm" variant="outline" onClick={() => {
                                                                        setEditPaymentRow(payment.id);
                                                                        setTempPayment({ method: payment.method, amount: payment.amount });
                                                                    }}>
                                                                        <Pencil className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="destructive" onClick={() => handleDeletePayment(payment.id)}>
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpen(false);

                                if (hasChanges) {
                                    router.reload({ only: ['sales'] });
                                }
                            }}
                        >
                            Cerrar
                        </Button>

                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmación detalle */}
            <Dialog open={confirmSave} onOpenChange={setConfirmSave}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar cambios</DialogTitle>
                        <DialogDescription>
                            ¿Seguro que deseas guardar los cambios en este producto?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmSave(false)}>Cancelar</Button>
                        <Button className="bg-blue-500 text-white" onClick={confirmSaveDetail}>Sí, guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmación pago */}
            <Dialog open={confirmPaymentSave} onOpenChange={setConfirmPaymentSave}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar cambios</DialogTitle>
                        <DialogDescription>
                            ¿Seguro que deseas guardar los cambios en este pago?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmPaymentSave(false)}>Cancelar</Button>
                        <Button className="bg-blue-500 text-white" onClick={confirmSavePayment}>Sí, guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
