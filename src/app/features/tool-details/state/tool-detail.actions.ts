import { createAction, props } from '@ngrx/store';

import {
  ToolAssemblyDetail,
  ToolAssemblyBillOfMaterial,
  ToolAssemblyGraphic2D,
  ToolAssemblyGraphicImage,
} from '../models/tool-detail.model';

// Basic Data

export const LoadToolAssembly = createAction(
  '[Tool Detail] Load Tool Assembly',
  props<{ toolId: string; toolType?: 'assembly' | 'item' }>()
);

export const LoadToolAssemblySuccess = createAction(
  '[Tool Detail] Load Tool Assembly Success',
  props<{ tool: ToolAssemblyDetail }>()
);

export const LoadToolAssemblyFailure = createAction(
  '[Tool Detail] Load Tool Assembly Failure',
  props<{ error: any }>()
);

// Bill Of Materials

export const LoadBillOfMaterials = createAction(
  '[Tool Detail] Load Bill Of Materials',
  props<{ toolId: string; toolType?: 'assembly' | 'item' }>()
);

export const LoadBillOfMaterialsSuccess = createAction(
  '[Tool Detail] Load Bill Of Materials Success',
  props<{ billOfMaterials: ToolAssemblyBillOfMaterial[] }>()
);

export const LoadBillOfMaterialsFailure = createAction(
  '[Tool Detail] Load Bill Of Materials Failure',
  props<{ error: any }>()
);

export const LoadSingleThumbnailSuccess = createAction(
  '[Tool Detail] Load Single Thumbnail Success',
  props<{ thumbnail: { id: string; url: string } }>()
);

// Graphics 2D

export const LoadGraphic2D = createAction(
  '[Tool Detail] Load Graphic 2D',
  props<{ toolId: string; toolType?: 'assembly' | 'item' }>()
);

export const LoadGraphic2DSuccess = createAction(
  '[Tool Detail] Load Graphic 2D Success',
  props<{ graphic2D: ToolAssemblyGraphic2D }>()
);

export const LoadGraphic2DFailure = createAction(
  '[Tool Detail] Load Graphic 2D Failure',
  props<{ error: any }>()
);

// Graphics Image

export const LoadGraphicImage = createAction(
  '[Tool Detail] Load Graphic Image',
  props<{ toolId: string; toolType?: 'assembly' | 'item' }>()
);

export const LoadGraphicImageSuccess = createAction(
  '[Tool Detail] Load Graphic Image Success',
  props<{ graphicImage: ToolAssemblyGraphicImage }>()
);

export const LoadGraphicImageFailure = createAction(
  '[Tool Detail] Load Graphic Image Failure',
  props<{ error: any }>()
);
