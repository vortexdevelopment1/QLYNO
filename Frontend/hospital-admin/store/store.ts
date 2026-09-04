import { configureStore } from '@reduxjs/toolkit';
import emergencyReducer from './slices/emergencySlice';
import ambulanceReducer from './slices/ambulanceSlice';
import procurementReducer from './slices/procurementSlice';
import surgicalReducer from './slices/surgicalSlice';
import wardsBedsReducer from './slices/wardsBedsSlice';
import hospitalProfileReducer from './slices/hospitalProfileSlice';
import contentResourcesReducer from './slices/contentResourcesSlice';
import patientReviewsReducer from './slices/patientReviewsSlice';
import documentsReducer from './slices/documentsSlice';
import integrationsReducer from './slices/integrationsSlice';
import nursingOperationsReducer from './slices/nursingOperationsSlice';

export const store = configureStore({
  reducer: {
    emergency: emergencyReducer,
    ambulance: ambulanceReducer,
    procurement: procurementReducer,
    surgical: surgicalReducer,
    wardsBeds: wardsBedsReducer,
    hospitalProfile: hospitalProfileReducer,
    contentResources: contentResourcesReducer,
    patientReviews: patientReviewsReducer,
    documents: documentsReducer,
    integrations: integrationsReducer,
    nursingOperations: nursingOperationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
