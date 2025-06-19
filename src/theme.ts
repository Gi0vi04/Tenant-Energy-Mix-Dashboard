import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "green.500",
        fontFamily: "Montserrat, sans-serif",
        h: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
    },
  },
  fonts: {
    heading: "Montserrat, sans-serif",
    body: "Montserrat, sans-serif",
  },
});

export default theme;
