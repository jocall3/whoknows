
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import type { ViewType, User, FileNode, Theme, VaultState } from '../types.ts';

// State shape
interface GlobalState {
  activeView: ViewType;
  viewProps: any;
  theme: Theme;
  hiddenFeatures: string[];
  vaultState: VaultState;
  connections: {
      github: User | null;
  };
  projectFiles: FileNode | null;
  selectedRepo: { owner: string; repo: string } | null;
}

// Action types
type Action =
  | { type: 'SET_VIEW'; payload: { view: ViewType, props?: any } }
  | { type: 'TOGGLE_FEATURE_VISIBILITY'; payload: { featureId: string } }
  | { type: 'SET_VAULT_STATE', payload: Partial<VaultState> }
  | { type: 'SET_GITHUB_CONNECTION', payload: User | null }
  | { type: 'LOAD_PROJECT_FILES'; payload: FileNode | null }
  | { type: 'SET_SELECTED_REPO'; payload: { owner: string; repo: string } | null }
  | { type: 'LOGOUT_GITHUB' };


const initialState: GlobalState = {
  activeView: 'ai-command-center',
  viewProps: {},
  theme: 'light',
  hiddenFeatures: [],
  vaultState: {
    isInitialized: false,
    isUnlocked: false,
  },
  connections: {
      github: null,
  },
  projectFiles: null,
  selectedRepo: null,
};

const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload.view, viewProps: action.payload.props || {} };
    case 'TOGGLE_FEATURE_VISIBILITY': {
        const { featureId } = action.payload;
        const isHidden = state.hiddenFeatures.includes(featureId);
        const newHiddenFeatures = isHidden
            ? state.hiddenFeatures.filter(id => id !== featureId)
            : [...state.hiddenFeatures, featureId];
        return { ...state, hiddenFeatures: newHiddenFeatures };
    }
    case 'SET_VAULT_STATE':
        return {
            ...state,
            vaultState: { ...state.vaultState, ...action.payload }
        };
    case 'SET_GITHUB_CONNECTION': {
        return {
            ...state,
            connections: { ...state.connections, github: action.payload },
            // Reset repo-specific data if disconnected
            selectedRepo: action.payload ? state.selectedRepo : null,
            projectFiles: action.payload ? state.projectFiles : null,
        };
    }
    case 'LOGOUT_GITHUB':
        return {
            ...state,
            connections: { ...state.connections, github: null },
            selectedRepo: null,
            projectFiles: null,
        };
    case 'LOAD_PROJECT_FILES':
      return { ...state, projectFiles: action.payload };
    case 'SET_SELECTED_REPO':
      return { ...state, selectedRepo: action.payload, projectFiles: null }; // Reset files on repo change
    default:
      return state;
  }
};

const GlobalStateContext = createContext<{
  state: GlobalState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

const LOCAL_STORAGE_KEY = 'devcore_snapshot';
const CONSENT_KEY = 'devcore_ls_consent';

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const canPersist = (() => {
        try {
            return localStorage.getItem(CONSENT_KEY) === 'granted';
        } catch (e) {
            return false;
        }
    })();

    const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
        if (!canPersist) return initial;
        
        try {
            const storedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!storedStateJSON) return initial;
            
            const storedState = JSON.parse(storedStateJSON);
            const hydratedState = { ...initial };

            // Hydrate state from local storage
            if (storedState.selectedRepo) hydratedState.selectedRepo = storedState.selectedRepo;
            if (storedState.activeView) hydratedState.activeView = storedState.activeView;
            if (storedState.hiddenFeatures) hydratedState.hiddenFeatures = storedState.hiddenFeatures;
            
            return hydratedState;
        } catch (error) {
            console.error("Failed to parse state from localStorage", error);
            return initial;
        }
    });

    useEffect(() => {
        if (!canPersist) return;

        const handler = setTimeout(() => {
            try {
                const stateToSave = { 
                    selectedRepo: state.selectedRepo,
                    activeView: state.activeView,
                    hiddenFeatures: state.hiddenFeatures,
                };
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
            } catch (error) {
                console.error("Failed to save state to localStorage", error);
            }
        }, 500);
        
        return () => clearTimeout(handler);
    }, [state, canPersist]);


    return (
        <GlobalStateContext.Provider value={{ state, dispatch }}>
            {children}
        </GlobalStateContext.Provider>
    );
};

export const useGlobalState = () => useContext(GlobalStateContext);