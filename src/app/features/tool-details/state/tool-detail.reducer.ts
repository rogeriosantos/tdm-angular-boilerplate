import { createFeature, createReducer, on } from '@ngrx/store';

import * as ToolDetailActions from './tool-detail.actions';
import {
  ToolAssemblyDetail,
  ToolAssemblyBillOfMaterial,
  ToolAssemblyGraphic2D,
} from '../models/tool-detail.model';

// --- Basic Data ---

export interface ToolDetailState {
  tool: ToolAssemblyDetail | null;
  loading: boolean;
  error: { status: number; message: string } | null;
}

const initialToolDetailState: ToolDetailState = {
  tool: null,
  loading: false,
  error: null,
};

const toolDetailReducer = createReducer(
  initialToolDetailState,
  on(ToolDetailActions.LoadToolAssembly, (state): ToolDetailState => ({
    ...state,
    loading: true,
  })),
  on(ToolDetailActions.LoadToolAssemblySuccess, (state, { tool }): ToolDetailState => ({
    ...state,
    tool,
    loading: false,
    error: null,
  })),
  on(ToolDetailActions.LoadToolAssemblyFailure, (state, { error }): ToolDetailState => ({
    ...state,
    loading: false,
    error: { status: error.status, message: error.message },
  }))
);

export const toolDetailFeature = createFeature({
  name: 'toolDetail',
  reducer: toolDetailReducer,
});

// --- Bill Of Materials ---

export interface ToolDetailBomState {
  entities: ToolAssemblyBillOfMaterial[];
  loading: boolean;
  thumbnailUrls: { [id: string]: string };
}

const initialBomState: ToolDetailBomState = {
  entities: [],
  loading: false,
  thumbnailUrls: {},
};

const toolDetailBomReducer = createReducer(
  initialBomState,
  on(ToolDetailActions.LoadBillOfMaterials, (state): ToolDetailBomState => ({
    ...state,
    entities: [],
    loading: true,
    thumbnailUrls: {},
  })),
  on(ToolDetailActions.LoadBillOfMaterialsSuccess, (state, { billOfMaterials }): ToolDetailBomState => ({
    ...state,
    entities: billOfMaterials,
    loading: false,
  })),
  on(
    ToolDetailActions.LoadSingleThumbnailSuccess,
    (state, { thumbnail }): ToolDetailBomState => ({
      ...state,
      thumbnailUrls: { ...state.thumbnailUrls, [thumbnail.id]: thumbnail.url },
    })
  )
);

export const toolDetailBomFeature = createFeature({
  name: 'toolDetailBom',
  reducer: toolDetailBomReducer,
});

// --- Graphics 2D ---

export interface ToolDetailGraphic2DState {
  graphic2D: ToolAssemblyGraphic2D | null;
  error: { status: number; message: string } | null;
  loading: boolean;
}

const initialGraphic2DState: ToolDetailGraphic2DState = {
  graphic2D: null,
  error: null,
  loading: false,
};

const toolDetailGraphic2DReducer = createReducer(
  initialGraphic2DState,
  on(ToolDetailActions.LoadGraphic2D, (state): ToolDetailGraphic2DState => ({
    ...state,
    loading: true,
  })),
  on(ToolDetailActions.LoadGraphic2DSuccess, (state, { graphic2D }): ToolDetailGraphic2DState => ({
    ...state,
    graphic2D,
    error: null,
    loading: false,
  })),
  on(ToolDetailActions.LoadGraphic2DFailure, (state, { error }): ToolDetailGraphic2DState => ({
    ...state,
    error: { status: error.status, message: error.message },
    loading: false,
  }))
);

export const toolDetailGraphic2DFeature = createFeature({
  name: 'toolDetailGraphic2D',
  reducer: toolDetailGraphic2DReducer,
});

// --- Graphics Image ---

export interface ToolDetailGraphicImageState {
  graphicImage: ToolAssemblyGraphic2D | null;
  error: { status: number; message: string } | null;
  loading: boolean;
}

const initialGraphicImageState: ToolDetailGraphicImageState = {
  graphicImage: null,
  error: null,
  loading: false,
};

const toolDetailGraphicImageReducer = createReducer(
  initialGraphicImageState,
  on(ToolDetailActions.LoadGraphicImage, (state): ToolDetailGraphicImageState => ({
    ...state,
    loading: true,
  })),
  on(ToolDetailActions.LoadGraphicImageSuccess, (state, { graphicImage }): ToolDetailGraphicImageState => ({
    ...state,
    graphicImage,
    error: null,
    loading: false,
  })),
  on(ToolDetailActions.LoadGraphicImageFailure, (state, { error }): ToolDetailGraphicImageState => ({
    ...state,
    error: { status: error.status, message: error.message },
    loading: false,
  }))
);

export const toolDetailGraphicImageFeature = createFeature({
  name: 'toolDetailGraphicImage',
  reducer: toolDetailGraphicImageReducer,
});
