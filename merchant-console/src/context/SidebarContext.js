import { React ,createContext, useState, useReducer} from "react";

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const initialState = { type: "DEFAULT_BAR", visible: false };

    const reducer = (state, action) => {
        switch(action.type) {
            case 'SETTINGS_BAR':
                return { ...state, type: "SETTINGS_BAR"};
            case 'WALLET_BAR':
                return { ...state, type: "WALLET_BAR"};
            case 'SHOW_BAR':
                return { ...state, visible: true};
            case 'HIDE_BAR':
                return { ...state, visible: false};
            default:
                return state;
        }
    }

    const [sidebarState, dispatch] = useReducer(reducer, initialState);

    return (
        <SidebarContext.Provider value={[sidebarState, dispatch]}>
            {children}
        </SidebarContext.Provider>
    );
}