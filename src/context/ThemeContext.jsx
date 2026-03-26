import React, { createContext, useContext, useEffect, useState } from "react";

const THEME_KEY = "theme";
const DARK = "dark";
const LIGHT = "light";

const ThemeContext = createContext({
    theme: LIGHT,
    isDark: false,
    toggleTheme: () => { },
    setTheme: (value) => { },
});

function getSystemTheme() {
    if (typeof window === "undefined") return LIGHT;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
}

/**
 * @param {{ children: React.ReactNode }} props
 */
export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(LIGHT);

    /** @param {"dark" | "light"} value */
    const applyTheme = (value) => {
        const root = document.documentElement;
        if (value === DARK) {
            root.classList.add(DARK);
        } else {
            root.classList.remove(DARK);
        }
    };

    /** @param {"dark" | "light"} value */
    const setTheme = (value) => {
        setThemeState(value);
        localStorage.setItem(THEME_KEY, value);
        applyTheme(value);
    };

    const toggleTheme = () => {
        setTheme(theme === DARK ? LIGHT : DARK);
    };

    useEffect(() => {
        const stored = localStorage.getItem(THEME_KEY);
        const initial = (stored === DARK || stored === LIGHT) ? stored : getSystemTheme();

        setThemeState(initial);
        applyTheme(initial);

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (!localStorage.getItem(THEME_KEY)) {
                const newSystemTheme = getSystemTheme();
                setThemeState(newSystemTheme);
                applyTheme(newSystemTheme);
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, isDark: theme === DARK, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
