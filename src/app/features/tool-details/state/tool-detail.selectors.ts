import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
  ToolDetailState,
  ToolDetailBomState,
  ToolDetailGraphic2DState,
  ToolDetailGraphicImageState,
} from './tool-detail.reducer';

// Basic Data

const selectToolDetailState = createFeatureSelector<ToolDetailState>('toolDetail');

export const selectToolAssembly = createSelector(
  selectToolDetailState,
  (state) => state.tool
);

export const selectToolAssemblyLoading = createSelector(
  selectToolDetailState,
  (state) => state.loading
);

export const selectToolAssemblyError = createSelector(
  selectToolDetailState,
  (state) => state.error
);

// Bill Of Materials

const selectBomFeatureState = createFeatureSelector<ToolDetailBomState>('toolDetailBom');

export const selectBillOfMaterials = createSelector(
  selectBomFeatureState,
  (state) => ({
    entities: state.entities,
    loading: state.loading,
  })
);

export const selectBomThumbnailUrls = createSelector(
  selectBomFeatureState,
  (state) => state.thumbnailUrls
);

// Graphics 2D

const selectGraphic2DState = createFeatureSelector<ToolDetailGraphic2DState>('toolDetailGraphic2D');

export const selectGraphics2D = createSelector(
  selectGraphic2DState,
  (state) => state.graphic2D
);

export const selectGraphics2DLoading = createSelector(
  selectGraphic2DState,
  (state) => state.loading
);

export const selectGraphics2DError = createSelector(
  selectGraphic2DState,
  (state) => state.error
);

// Graphics Image

const selectGraphicImageState = createFeatureSelector<ToolDetailGraphicImageState>('toolDetailGraphicImage');

export const selectGraphicsImage = createSelector(
  selectGraphicImageState,
  (state) => state.graphicImage
);

export const selectGraphicsImageLoading = createSelector(
  selectGraphicImageState,
  (state) => state.loading
);

export const selectGraphicsImageError = createSelector(
  selectGraphicImageState,
  (state) => state.error
);
