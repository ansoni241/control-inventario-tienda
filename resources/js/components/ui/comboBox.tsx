import * as React from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

interface Option {
    id: number;
    name: string;
}

interface ComboBoxProps {
    options: Option[];
    value: number | null;
    onChange: (id: number) => void;
    placeholder?: string;
}

export function ComboBox({ options, value, onChange, placeholder }: ComboBoxProps) {
    const [open, setOpen] = React.useState(false);

    const selected = options.find((opt) => opt.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                >
                    {selected ? selected.name : placeholder ?? "Seleccionar..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]">
                <Command>
                    <CommandInput placeholder="Buscar..." />
                    <CommandList>
                        <CommandEmpty>No encontrado</CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt.id}
                                    onSelect={() => {
                                        onChange(opt.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={`mr-2 h-4 w-4 ${value === opt.id ? "opacity-100" : "opacity-0"}`}
                                    />
                                    {opt.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
