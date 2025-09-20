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
import { toast } from "sonner";

interface SalePayment {
    id?: number;
    method: string;
    amount: number;
}

interface SaleSummary {
    id: number;
    customer_name: string;
    user_name: string;
    date: string;
    total: number;
    paid: number;
    status: 'pendiente' | 'pagado' | 'cancelado';
}

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    saleId: number;
    onPaymentSuccess?: () => void;
}

export default function SalePaymentModal({ open, setOpen, saleId, onPaymentSuccess }: Props) {
    const [sale, setSale] = useState<SaleSummary | null>(null);
    const [payments, setPayments] = useState<SalePayment[]>([]);
    const [newPayment, setNewPayment] = useState<SalePayment>({ method: 'efectivo', amount: 0 });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        axios.get(`/sales/${saleId}`)
            .then(({ data }) => {
                setSale({
                    id: data.sale.id,
                    customer_name: data.sale.customer_name ?? '—',
                    user_name: data.sale.user_name ?? '—',
                    date: data.sale.date,
                    total: data.sale.total,
                    paid: data.sale.paid ?? 0,
                    status: data.sale.status,
                });
                setPayments(data.payments ?? []);
            })
            .catch((error: unknown) => {
                if (error && typeof error === 'object' && 'response' in error) {
                    const err = error as { response?: { data?: { message?: string } } };
                    toast.error(err.response?.data?.message ?? "Error al cargar la venta");
                } else {
                    toast.error("Error al cargar la venta");
                }
            });
    }, [open, saleId]);

    const handleSavePayment = async () => {
        if (!sale) return;
        if (newPayment.amount <= 0) return toast.error("Ingrese un monto válido");

        if (!confirm(`¿Está seguro de registrar un pago de ${newPayment.amount.toFixed(2)}?`)) return;

        setSaving(true);
        try {
            const { data } = await axios.post(`/sales/${sale.id}/payments`, newPayment);
            setPayments(prev => [...prev, data.payment]);
            setSale(prev => prev ? { ...prev, paid: data.paid } : prev);
            setNewPayment({ method: 'efectivo', amount: 0 });
            setOpen(false);
            toast.success("Pago realizado con éxito");
            onPaymentSuccess?.();
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error(err.response?.data?.message ?? "Error al registrar el pago");
            } else {
                toast.error("Error al registrar el pago");
            }
        } finally {
            setSaving(false);
        }
    };

    if (!sale) return null;

    const remaining = Math.max(0, sale.total - sale.paid);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
                <div className="overflow-y-auto px-4 py-2 flex-1 space-y-4">
                    <DialogHeader>
                        <DialogTitle>Registrar pago - Venta #{sale.id}</DialogTitle>
                        <DialogDescription>Información de la venta y pagos registrados</DialogDescription>
                    </DialogHeader>

                    {/* Info de venta */}
                    <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <p><b>Cliente:</b> {sale.customer_name}</p>
                            <p><b>Registrado por:</b> {sale.user_name}</p>
                            <p><b>Fecha:</b> {sale.date}</p>
                            <p><b>Status:</b> {sale.status}</p>
                            <p><b>Total:</b> {sale.total.toFixed(2)}</p>
                            <p><b>Pagado:</b> {sale.paid.toFixed(2)}</p>
                            <p className="col-span-2 text-right"><b>Falta por pagar:</b> {remaining.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Formulario nuevo pago */}
                    <div className="bg-white border rounded-lg p-4 shadow-sm space-y-2">
                        <h4 className="font-semibold">Agregar nuevo pago</h4>
                        <div className="flex gap-2">
                            <select
                                className="border rounded px-2 py-1 flex-1"
                                value={newPayment.method}
                                onChange={e => setNewPayment(prev => ({ ...prev, method: e.target.value }))}
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="qr">QR</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="otros">Otros</option>
                            </select>
                            <Input
                                type="number"
                                placeholder="Monto"
                                value={newPayment.amount}
                                onChange={e => setNewPayment(prev => ({ ...prev, amount: Number(e.target.value) }))}
                            />
                        </div>
                    </div>

                    {/* Listado de pagos */}
                    {payments.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border text-sm text-gray-700">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Método</th>
                                        <th className="px-3 py-2 text-center">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="px-3 py-2">{p.method}</td>
                                            <td className="px-3 py-2 text-center">{Number(p.amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
                    <Button className="bg-blue-500 text-white" onClick={handleSavePayment} disabled={saving || remaining <= 0}>
                        {saving ? "Guardando..." : "Registrar pago"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
