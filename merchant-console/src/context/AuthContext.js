import Cookies from "js-cookie";
import { React ,createContext, useReducer, useEffect } from "react";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload.token, firstName: action.payload.firstName }
        case 'LOGOUT':
            return { user: null, firstName: null}
        default:
            return state;
    }
}

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: Cookies.get('merchant-auth-token') ? {token:Cookies.get('merchant-auth-token')} : null
    });

    useEffect(() => {
        if(Cookies.get('merchant-auth-token') && !state.user){
            dispatch({type: 'LOGIN', payload: {token: Cookies.get('merchant-auth-token')}});
        }
    }, [state.user])

    return (
        <AuthContext.Provider value={{...state, dispatch}}>
            { children }
        </AuthContext.Provider>
    );
};