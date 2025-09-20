<?php

namespace App\Exports;

use App\Models\SaleDetail;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class SalesReportExport implements FromCollection, WithHeadings, WithEvents, WithStyles
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
        $query = SaleDetail::query()->with(['sale.customer', 'product']);

        if (!empty($this->from) && !empty($this->to)) {
            $query->whereHas('sale', function ($q) {
                $q->whereBetween('date', [$this->from, $this->to]);
            });
        }

        $detailsCollection = $query->get();
        $details = collect();

        foreach ($detailsCollection as $detail) {
            $cantidad = (float) $detail->quantity;
            $precio = (float) $detail->price;
            $subtotal = $cantidad * $precio;

            $details->push([
                'Fecha' => optional($detail->sale)->date ? Carbon::parse($detail->sale->date)->format('d/m/Y') : '',
                'Cliente' => optional($detail->sale->customer)->name,
                'Producto' => optional($detail->product)->name,
                'Cantidad' => $cantidad,
                'Precio' => $precio,
                'Subtotal' => $subtotal,
            ]);
        }

        // Calcular y agregar la fila de totales
        $quantityTotal = $details->sum('Cantidad');
        $priceTotal = $details->sum('Precio');
        $subtotalTotal = $details->sum('Subtotal');

        $totals = [
            'Fecha' => '',
            'Cliente' => '',
            'Producto' => 'Total',
            'Cantidad' => $quantityTotal,
            'Precio' => $priceTotal,
            'Subtotal' => $subtotalTotal,
        ];
        $details->push($totals);

        return $details;
    }

    public function headings(): array
    {
        return ['Fecha', 'Cliente', 'Producto', 'Cantidad', 'Precio', 'Subtotal'];
    }

    public function styles(Worksheet $sheet)
    {
        // Estilos para la fila de encabezados
        $sheet->getStyle('A1:F1')->getFont()->setBold(true);

        // Estilos para la fila de totales
        $highestRow = $sheet->getHighestRow();
        $sheet->getStyle("A{$highestRow}:F{$highestRow}")->getFont()->setBold(true);

        return [];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Centra y aplica estilos al título y la fecha de impresión
                $highestRow = $sheet->getHighestRow();

                $sheet->setCellValue('A' . ($highestRow + 2), 'Reporte de Ventas');
                $sheet->mergeCells('A' . ($highestRow + 2) . ':F' . ($highestRow + 2));
                $sheet->getStyle('A' . ($highestRow + 2))->getFont()->setBold(true)->setSize(14);
                $sheet->getStyle('A' . ($highestRow + 2))->getAlignment()->setHorizontal('center');

                $sheet->setCellValue('A' . ($highestRow + 3), 'Fecha de impresión: ' . Carbon::now()->format('d/m/Y H:i'));
                $sheet->mergeCells('A' . ($highestRow + 3) . ':F' . ($highestRow + 3));
                $sheet->getStyle('A' . ($highestRow + 3))->getAlignment()->setHorizontal('center');

                // Autoajustar ancho de las columnas
                foreach (range('A', 'F') as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }
            },
        ];
    }
}
