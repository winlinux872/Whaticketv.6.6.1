import React, { useState, useEffect } from "react";

import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
import lightBackground from '../src/assets/wa-background-light.png';
import darkBackground from '../src/assets/wa-background-dark.jpg';
import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";
import { SocketContext, SocketManager } from './context/Socket/SocketContext';

import Routes from "./routes";

const queryClient = new QueryClient();

const App = () => {
    const [locale, setLocale] = useState();

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const preferredTheme = window.localStorage.getItem("preferredTheme");
    const [mode, setMode] = useState(preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light");

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
            },
        }),
        []
    );

    const theme = createTheme(
        {
            scrollbarStyles: {
                "&::-webkit-scrollbar": {
                    width: '8px',
                    height: '8px',
                    borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
                    // Substituímos o verde pelo azul principal do degradê
                    backgroundColor: mode === "light" ? "#007BFF" : "#3B82F6", 
                    borderRadius: "8px",
                },
            },
            scrollbarStylesSoft: {
                "&::-webkit-scrollbar": {
                    width: "8px",
                    borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    // Usamos tons que dão contraste com o fundo sem ser chamativos demais
                    backgroundColor: mode === "light" ? "#B0BEC5" : "#455A64",
                    borderRadius: "8px",
                },
            },
            palette: {
                type: mode,
                primary: { main: mode === "light" ? "#007BFF" : "#60A5FA" },
                quicktags: { main: mode === "light" ? "#007BFF" : "#60A5FA" },
                sair: { main: mode === "light" ? "#007BFF" : "#FF4D4D" }, // Vermelho no dark para destaque de saída
                vcard: { main: mode === "light" ? "#007BFF" : "#BBDEFB" },
                textPrimary: mode === "light" ? "#0047AB" : "#FFFFFF",
                borderPrimary: mode === "light" ? "#007BFF" : "#3B82F6",
                dark: { main: mode === "light" ? "#333333" : "#F3F3F3" },
                light: { main: mode === "light" ? "#F3F3F3" : "#333333" },
                tabHeaderBackground: mode === "light" ? "#F5F7FA" : "#242424",
                ticketlist: mode === "light" ? "#F0F2F5" : "#1E1E1E",
                optionsBackground: mode === "light" ? "#F0F2F5" : "#1E1E1E",
                options: mode === "light" ? "#FFFFFF" : "#2C2C2C",
                fontecor: mode === "light" ? "#0047AB" : "#E3F2FD",
                fancyBackground: mode === "light" ? "#F0F2F5" : "#1E1E1E",
                bordabox: mode === "light" ? "#E1E8ED" : "#333",
                newmessagebox: mode === "light" ? "#E1E8ED" : "#333",
                inputdigita: mode === "light" ? "#FFFFFF" : "#2C2C2C",
                contactdrawer: mode === "light" ? "#FFFFFF" : "#2C2C2C",
                announcements: mode === "light" ? "#F0F2F5" : "#2C2C2C",
                login: mode === "light" ? "#FFFFFF" : "#121212",
                announcementspopover: mode === "light" ? "#FFFFFF" : "#2C2C2C",
                chatlist: mode === "light" ? "#F0F2F5" : "#242424",
                boxlist: mode === "light" ? "#F0F2F5" : "#242424",
                boxchatlist: mode === "light" ? "#F0F2F5" : "#1E1E1E",
                total: mode === "light" ? "#FFFFFF" : "#1A1A1A",
                messageIcons: mode === "light" ? "#546E7A" : "#BBDEFB",
                inputBackground: mode === "light" ? "#FFFFFF" : "#2C2C2C",
                barraSuperior: mode === "light" ? "linear-gradient(to left, #0047AB, #007BFF, #00D4FF)" : "#121212",
                boxticket: mode === "light" ? "#F5F7FA" : "#2C2C2C",
                campaigntab: mode === "light" ? "#F0F2F5" : "#242424",
                mediainput: mode === "light" ? "#F0F2F5" : "#121212",
                contadordash: mode == "light" ? "#007BFF" : "#60A5FA",
            },
            mode,
        },
        locale
    );

    useEffect(() => {
        const i18nlocale = localStorage.getItem("i18nextLng");
        const browserLocale =
            i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

        if (browserLocale === "ptBR") {
            setLocale(ptBR);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("preferredTheme", mode);
    }, [mode]);



    return (
        <ColorModeContext.Provider value={{ colorMode }}>
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                  <SocketContext.Provider value={SocketManager}>
                      <Routes />
                  </SocketContext.Provider>
                </QueryClientProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default App;
