import {React, createContext, useState} from "react";

export const NavbarVisContext = createContext()

export const NavbarVisContextProvider = ({ children }) => {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <NavbarVisContext.Provider value={{ isVisible, setIsVisible }}>
            {children}
        </NavbarVisContext.Provider>
    );
}