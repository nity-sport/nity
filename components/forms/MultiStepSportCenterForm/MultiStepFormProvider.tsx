import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SportCenterType } from '../../../src/types/sportcenter';

interface FormDataType extends Omit<Partial<SportCenterType>, 'photos' | 'dormitoryPhotos' | 'hosterImage' | 'facilities'> {
  logo?: File;
  hosterImage?: File | string;
  photos?: File[] | string[];
  dormitoryPhotos?: File[] | string[];
  facilities?: string[];
  termsAccepted?: boolean;
  accountData?: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  userAccount?: {
    token: string;
    user: any;
  };
}

export interface FormStep {
  id: number;
  title: string;
  component: React.ComponentType<any>;
  isValid?: boolean;
  isOptional?: boolean;
}

export interface MultiStepFormState {
  currentStep: number;
  formData: FormDataType;
  steps: FormStep[];
  isLoading: boolean;
  errors: Record<string, string>;
  customSports: string[];
  customFacilities: string[];
  completedSteps: number[];
  validSteps: Record<number, boolean>;
  showErrors: Record<number, boolean>;
}

export type FormAction = 
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<FormDataType> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'ADD_CUSTOM_SPORT'; payload: string }
  | { type: 'ADD_CUSTOM_FACILITY'; payload: string }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'SET_STEP_VALID'; payload: { stepIndex: number; isValid: boolean } }
  | { type: 'SET_SHOW_ERRORS'; payload: { stepIndex: number; show: boolean } }
  | { type: 'RESET_FORM' };

const initialState: MultiStepFormState = {
  currentStep: 0,
  formData: {
    name: '',
    yearOfFoundation: new Date().getFullYear().toString(),
    sportcenterBio: '',
    photos: [],
    sport: [],
    facilities: [],
    categories: [],
    achievements: [],
    location: {
      street: '',
      city: '',
      state: '',
      country: 'Brazil',
      zip_code: '',
      number: ''
    },
    hosterName: '',
    hostBio: '',
    hosterImage: '',
    dormitory: false,
    dormitoryCosts: undefined,
    dormitoryPhotos: [],
    dormitoryFacilities: [],
    experienceCost: undefined
  },
  steps: [],
  isLoading: false,
  errors: {},
  customSports: [],
  customFacilities: [],
  completedSteps: [],
  validSteps: {},
  showErrors: {}
};

function formReducer(state: MultiStepFormState, action: FormAction): MultiStepFormState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload
        }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload
      };
    
    case 'ADD_CUSTOM_SPORT':
      return {
        ...state,
        customSports: [...state.customSports, action.payload]
      };
    
    case 'ADD_CUSTOM_FACILITY':
      return {
        ...state,
        customFacilities: [...state.customFacilities, action.payload]
      };
    
    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload]
      };
    
    case 'SET_STEP_VALID':
      return {
        ...state,
        validSteps: {
          ...state.validSteps,
          [action.payload.stepIndex]: action.payload.isValid
        }
      };
    
    case 'SET_SHOW_ERRORS':
      return {
        ...state,
        showErrors: {
          ...state.showErrors,
          [action.payload.stepIndex]: action.payload.show
        }
      };
    
    case 'RESET_FORM':
      return initialState;
    
    default:
      return state;
  }
}

interface MultiStepFormContextType {
  state: MultiStepFormState;
  dispatch: React.Dispatch<FormAction>;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
}

const MultiStepFormContext = createContext<MultiStepFormContextType | null>(null);

export function useMultiStepForm() {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error('useMultiStepForm must be used within a MultiStepFormProvider');
  }
  return context;
}

interface MultiStepFormProviderProps {
  children: ReactNode;
  steps: FormStep[];
  initialData?: Partial<FormDataType>;
}

export function MultiStepFormProvider({ children, steps, initialData }: MultiStepFormProviderProps) {
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    steps,
    formData: initialData ? { ...initialState.formData, ...initialData } : initialState.formData
  });

  const getNextStep = (currentStep: number): number => {
    const currentStepId = state.steps[currentStep]?.id;
    
    // If we're on Step 10 (Dormitory Question) and dormitory is false, skip to Step 14 (Pricing)
    if (currentStepId === 10 && state.formData.dormitory === false) {
      // Find Step 14 (Pricing) index
      const pricingStepIndex = state.steps.findIndex(step => step.id === 14);
      return pricingStepIndex !== -1 ? pricingStepIndex : currentStep + 1;
    }
    
    return currentStep + 1;
  };

  const getPreviousStep = (currentStep: number): number => {
    const currentStepId = state.steps[currentStep]?.id;
    
    // If we're on Step 14 (Pricing) and dormitory is false, go back to Step 10 (Dormitory Question)
    if (currentStepId === 14 && state.formData.dormitory === false) {
      // Find Step 10 (Dormitory Question) index
      const dormitoryStepIndex = state.steps.findIndex(step => step.id === 10);
      return dormitoryStepIndex !== -1 ? dormitoryStepIndex : currentStep - 1;
    }
    
    return currentStep - 1;
  };

  const nextStep = () => {
    // Mark that we should show errors for current step if it's invalid
    const isCurrentStepValid = state.validSteps[state.currentStep] === true;
    if (!isCurrentStepValid) {
      dispatch({ 
        type: 'SET_SHOW_ERRORS', 
        payload: { stepIndex: state.currentStep, show: true } 
      });
      return; // Don't proceed if step is invalid
    }

    const nextStepIndex = getNextStep(state.currentStep);
    if (nextStepIndex < state.steps.length) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.currentStep });
      dispatch({ type: 'SET_CURRENT_STEP', payload: nextStepIndex });
    }
  };

  const previousStep = () => {
    const prevStepIndex = getPreviousStep(state.currentStep);
    if (prevStepIndex >= 0) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: prevStepIndex });
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < state.steps.length) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    }
  };

  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === state.steps.length - 1;
  const canProceed = true; // Always allow clicking Continue, validation happens in nextStep

  return (
    <MultiStepFormContext.Provider
      value={{
        state,
        dispatch,
        nextStep,
        previousStep,
        goToStep,
        isFirstStep,
        isLastStep,
        canProceed
      }}
    >
      {children}
    </MultiStepFormContext.Provider>
  );
}