import { createTheme } from "@mui/material/styles";

export const mobileWidth = 700;
export const tabletWidth = 960;
export const mobileMaxWidthMediaQuery = `@media (max-width:${mobileWidth}px)`;
export const tabletMaxWidthMediaQuery = `@media (max-width:${tabletWidth}px)`;

export const FontWeightValues = {
    THIN: 100,
    EXTRA_LIGHT: 200,
    LIGHT: 300,
    REGULAR: 400,
    MEDIUM: 500,
    SEMI_BOLD: 600,
    BOLD: 700,
    EXTRA_BOLD: 800,
    BLACK: 900,
    EXTAR_BLACK: 950,
};

// Create a theme instance.
export const theme = createTheme({
    palette: {
        primary: {
            main: "#00000",
        },
        secondary: {
            main: "#FAFAFA",
        },
        common: {
            black: "#000",
            white: "#fff",
        },
        text: {
            primary: "#666666",
            secondary: "#999",
            disabled: "#C1C1C1",
        },
        info: {
            main: "#F0F0F0",
        },
        error: {
            main: "#ff0000",
        },

        black: {
            main: "#000000",
            900: "#000000",
            800: "#191919",
            700: "#333333",
            600: "#666666",
            500: "#999999",
        },
        grey: {
            main: "#AEAEAE",
            500: "#AEAEAE",
            400: "#BBBBBB",
            300: "#C4C4C4",
            200: "#E0E0E0",
            100: "#EEEEEE",
            50: "#f4f4f4",
            30: "#f9f9f9",
        },
        white: {
            main: "#ffffff",
        },
    },

    typography: {
        fontFamily: [
            "AppleSDGothicNeo",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
        h1: {
            fontWeight: FontWeightValues.EXTRA_BOLD,
            fontSize: "68px",
            lineHeight: 1.5,
            letterSpacing: "0.02em",
            wordBreak: "keep-all",
        },
        h2: {
            fontWeight: FontWeightValues.BOLD,
            fontSize: "48px",
            letterSpacing: "0.02em",
            lineHeight: 1.5,
            wordBreak: "keep-all",
        },
        h3: {
            fontWeight: FontWeightValues.BOLD,
            fontSize: "36px",
            lineHeight: 1.5,
            letterSpacing: "0.015em",
            wordBreak: "keep-all",
        },
        h4: {
            fontWeight: FontWeightValues.BOLD,
            fontSize: "30px",
            lineHeight: 1.3,
            letterSpacing: "0.015em",
            wordBreak: "keep-all",
        },
        subtitle1: {
            fontWeight: FontWeightValues.BOLD,
            fontSize: "32px",
            lineHeight: 1.5,
            letterSpacing: "0.015em",
            wordBreak: "keep-all",
        },
        subtitle2: {
            fontWeight: FontWeightValues.BOLD,
            fontSize: "24px",
            lineHeight: 1.5,
            letterSpacing: "0.015em",
            wordBreak: "keep-all",
        },
        body1: {
            fontWeight: FontWeightValues.BOLD,
            fontSize: "20px",
            lineHeight: 1.5,
            letterSpacing: "0.01em",
            wordBreak: "keep-all",
        },
        body2: {
            fontWeight: FontWeightValues.REGULAR,
            fontSize: "18px",
            lineHeight: 1.5,
            letterSpacing: "0.005em",
            wordBreak: "keep-all",
        },
        body3: {
            fontWeight: FontWeightValues.REGULAR,
            fontSize: "16px",
            lineHeight: 1.5,
            letterSpacing: "0.005em",
            wordBreak: "keep-all",
        },
        body4: {
            fontWeight: FontWeightValues.REGULAR,
            fontSize: "15px",
            lineHeight: 1.5,
            letterSpacing: "0.005em",
            wordBreak: "keep-all",
        },
        body5: {
            fontWeight: FontWeightValues.REGULAR,
            fontSize: "14px",
            lineHeight: 1.5,
            letterSpacing: "0.005em",
            wordBreak: "keep-all",
        },
    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: "5px",
                    boxShadow: "none",
                    textTransform: "none",
                    "&:hover": {
                        boxShadow: "none",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: "none",
                    border: "solid 1px #E5E8EB",
                    borderRadius: "5px",
                },
            },
        },
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    height: "24px",
                    width: "24px",
                    minWidth: "24px",
                    borderRadius: "5px",
                    fontWeight: 600,
                    "&.Mui-selected": { color: "black" },
                    "&.Mui-disabled": { display: "none" },
                    "&.MuiPaginationItem-previousNext": {
                        border: "solid 1px #E0E0E0",
                    },
                },
            },
        },
    },
});