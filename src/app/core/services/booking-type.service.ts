import { Injectable } from '@angular/core';

export interface BookingType {
  id: number;
  code: string;
  labelDe: string;
  labelEn: string;
}

const BOOKING_TYPES: BookingType[] = [
  { id: -1, code: 'LGM_NEW', labelDe: 'Neuzugang', labelEn: 'New arrival' },
  { id: -2, code: 'LGM_SORTOUT', labelDe: 'Aussondern', labelEn: 'Sort out' },
  { id: -3, code: 'LGM_BOOKITEM', labelDe: 'Buchen', labelEn: 'Book item' },
  { id: -4, code: 'LGM_BOOKTOREPAIR', labelDe: 'Buchen in Instandsetzung', labelEn: 'Book to repair' },
  { id: -5, code: 'LGM_BOOKFROMREPAIR', labelDe: 'Rueckbuchen aus Instandsetzung', labelEn: 'Book from repair' },
  { id: -6, code: 'LGM_ASSEMBLY', labelDe: 'Montieren', labelEn: 'Assemble' },
  { id: -7, code: 'LGM_DISASSEMBLY', labelDe: 'Demontieren', labelEn: 'Disassemble' },
  { id: -8, code: 'LGM_INVENTORY', labelDe: 'Inventur', labelEn: 'Inventory' },
  { id: -9, code: 'LGM_SHIFTNEWUSEDTOREPAIR', labelDe: 'Verschieben in Reparaturbestand', labelEn: 'Shift to repair stock' },
  { id: -10, code: 'LGM_SHIFTREPAIRTOUSED', labelDe: 'Verschieben in Gebrauchtbestand', labelEn: 'Shift to used stock' },
  { id: -11, code: 'LGM_BOOKASSEMBLYDEL', labelDe: 'Teilbuchung (Abbuchen) beim Montieren', labelEn: 'Partial booking (remove) on assembly' },
  { id: -12, code: 'LGM_BOOKASSEMBLYINS', labelDe: 'Teilbuchung (Zubuchen) beim Montieren', labelEn: 'Partial booking (add) on assembly' },
  { id: -13, code: 'LGM_BOOKDISASSEMBLYDEL', labelDe: 'Teilbuchung (Abbuchen) beim Demontieren', labelEn: 'Partial booking (remove) on disassembly' },
  { id: -14, code: 'LGM_BOOKDISASSEMBLYINS', labelDe: 'Teilbuchung (Zubuchen) beim Demontieren', labelEn: 'Partial booking (add) on disassembly' },
  { id: -15, code: 'LGM_BOOKPIECELIST', labelDe: 'Buchen einer Stueckliste', labelEn: 'Book piece list' },
  { id: -16, code: 'LGM_CORRECT', labelDe: 'Nachkorrekturen', labelEn: 'Corrections' },
  { id: -20, code: 'LGM_CHANGESTOCKDATA', labelDe: 'Aenderung von Bestandsdaten', labelEn: 'Change stock data' },
  { id: -21, code: 'LGM_CHANGEINASSEMBLY', labelDe: 'Aenderung von Bestandsdaten', labelEn: 'Change in assembly' },
  { id: -30, code: 'LGM_INSORDER', labelDe: 'Eintragen in Bestelltabelle', labelEn: 'Insert into order table' },
  { id: -50, code: 'LGM_BOOKLISTTDM', labelDe: 'Liste Buchen', labelEn: 'Book list' },
  { id: -51, code: 'LGM_BOOKLISTIMPORTDATA', labelDe: 'Import data', labelEn: 'Import data' },
];

@Injectable({
  providedIn: 'root',
})
export class BookingTypeService {
  private readonly types = BOOKING_TYPES;
  private readonly byId = new Map<number, BookingType>(
    BOOKING_TYPES.map((t) => [t.id, t])
  );
  private readonly byCode = new Map<string, BookingType>(
    BOOKING_TYPES.map((t) => [t.code, t])
  );

  getAll(): BookingType[] {
    return this.types;
  }

  getById(id: number): BookingType | undefined {
    return this.byId.get(id);
  }

  getByCode(code: string): BookingType | undefined {
    return this.byCode.get(code);
  }

  getLabel(id: number, lang: 'en' | 'de'): string {
    const type = this.byId.get(id);
    if (!type) return String(id);
    return lang === 'de' ? type.labelDe : type.labelEn;
  }
}
