import { grey, green, indigo } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? grey[900] : grey[50],
  },
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || (darkMode ? "#D60024" : "#D60024"),
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || (darkMode ? "#D60024" : "#D60024"),
  },
  neutral: {
    main: grey[500],
  },
  geometry: {
    main: '#59EA4F',
  },
  resetColor: {
    main: validatedColor(server?.attributes?.colorPrimary) || (darkMode ? "#fff" : "#D60024"),
  },
  logoImage: {
    main: validatedColor(server?.attributes?.colorPrimary) || (darkMode ? "logo.png" : "logo-light.png"),
  },
});
