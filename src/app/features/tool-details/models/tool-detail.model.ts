export interface ToolClassType {
  id: string;
  name: string;
}

export interface ToolClass {
  toolClassType: ToolClassType;
  id: string;
  name: string;
}

export interface ToolGroup {
  id: string;
  name: string;
}

export interface CuttingGrade {
  id: string;
  name: string;
}

export interface ToolAssemblyDetail {
  id: string;
  name: string;
  description: string;
  toolClass: ToolClass;
  toolGroup: ToolGroup;
  cuttingGrade: CuttingGrade;
  toolNumber: string | null;
  weight: number;
  toolClassId: string;
  toolGroupId: string;
  cuttingGradeId: string;
  cadId: string;
}

export interface ToolItemBillOfMaterialElement {
  id: string;
  name: string;
  description: string;
}

export interface ToolAssemblyBillOfMaterial {
  position: number;
  elementToolItemId: string;
  elementToolItem: ToolItemBillOfMaterialElement;
  quantity?: number;
}

export type ToolAssemblyGraphic2D = Blob;
export type ToolAssemblyGraphicImage = Blob;
