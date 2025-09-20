<?php

namespace App\Exports;

use App\Models\PurchaseDetail;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class PurchaseReportExport implements FromCollection, WithHeadings, WithEvents, WithStyles
{
    protected $from;
    protected $to;

    public function __construct($from = null, $to = null)
    {
        $this->from = $from;
        $this->to = $to;
    }

    public function collection()
    {
        $query = PurchaseDetail::query()->with(['purchase.supplier', 'product']);

        if (!empty($this->from) && !empty($this->to)) {
            $query->whereHas('purchase', function ($q) {
                $q->whereBetween('date', [$this->from, $this->to]);
            });
        }

        $detailsCollection = $query->get();
        $details = collect();

        foreach ($detailsCollection as $detail) {
            $subtotal = (float)$detail->quantity * (float)$detail->price;

            $details->push([
                'Fecha' => optional($detail->purchase)->date ? Carbon::parse($detail->purchase->date)->format('d/m/Y') : '',
                'Proveedor' => optional($detail->purchase->supplier)->name,
                'Producto' => optional($detail->product)->name,
                'Cantidad' => (float)$detail->quantity,
                'Precio' => (float)$detail->price,
                'Subtotal' => $subtotal,
                'Factura' => $detail->purchase->invoice_number,
                'Notas' => $detail->purchase->notes,
            ]);
        }

        // Totales
        $quantityTotal = $details->sum('Cantidad');
        $priceTotal = $details->sum('Precio');
        $subtotalTotal = $details->sum('Subtotal');

        $totals = [
            'Fecha' => '',
            'Proveedor' => '',
            'Producto' => 'Total',
            'Cantidad' => $quantityTotal,
            'Precio' => $priceTotal,
            'Subtotal' => $subtotalTotal,
            'Factura' => '',
            'Notas' => '',
        ];

        $details->push($totals);

        return $details;
    }

    public function headings(): array
    {
        return ['Fecha', 'Proveedor', 'Producto', 'Cantidad', 'Precio', 'Subtotal', 'Factura', 'Notas'];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:H1')->getFont()->setBold(true);
        $highestRow = $sheet->getHighestRow();
        $sheet->getStyle("A{$highestRow}:H{$highestRow}")->getFont()->setBold(true);

        return [];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();

                $sheet->setCellValue('A' . ($highestRow + 2), 'Reporte de Compras');
                $sheet->mergeCells('A' . ($highestRow + 2) . ':H' . ($highestRow + 2));
                $sheet->getStyle('A' . ($highestRow + 2))->getFont()->setBold(true)->setSize(14);
                $sheet->getStyle('A' . ($highestRow + 2))->getAlignment()->setHorizontal('center');

                $sheet->setCellValue('A' . ($highestRow + 3), 'Fecha de impresión: ' . Carbon::now()->format('d/m/Y H:i'));
                $sheet->mergeCells('A' . ($highestRow + 3) . ':H' . ($highestRow + 3));
                $sheet->getStyle('A' . ($highestRow + 3))->getAlignment()->setHorizontal('center');

                // Autoajustar ancho de columnas
                foreach (range('A', 'H') as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }
            },
        ];
    }
}
