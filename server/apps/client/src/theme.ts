import { createTheme } from '@mui/material/styles';

// Star Trek inspired colors
const colors = {
  primary: {
    main: '#00B4D8', // LCARS blue
    light: '#48CAE4',
    dark: '#0077B6',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF4D6D', // LCARS red
    light: '#FF8FA3',
    dark: '#C9184A',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#03045E', // Deep space blue
    paper: '#023E8A', // Darker space blue
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#90E0EF',
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
  },
  warning: {
    main: '#FFC107',
    light: '#FFD54F',
    dark: '#FFA000',
  },
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
  },
};

// Custom component styles
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        background: `linear-gradient(135deg, ${colors.background.default} 0%, ${colors.background.paper} 100%)`,
        minHeight: '100vh',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: colors.background.paper,
        borderRadius: 8,
        border: `1px solid ${colors.primary.main}20`,
        boxShadow: `0 0 20px ${colors.primary.main}20`,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: colors.background.paper,
        borderRadius: 8,
        border: `1px solid ${colors.primary.main}20`,
        boxShadow: `0 0 20px ${colors.primary.main}20`,
        '&:hover': {
          boxShadow: `0 0 30px ${colors.primary.main}40`,
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        textTransform: 'none',
        fontWeight: 600,
        padding: '8px 16px',
        background: `linear-gradient(45deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
        '&:hover': {
          background: `linear-gradient(45deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
        },
      },
      outlined: {
        borderColor: colors.primary.main,
        color: colors.primary.main,
        '&:hover': {
          borderColor: colors.primary.light,
          backgroundColor: `${colors.primary.main}20`,
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        background: `linear-gradient(90deg, ${colors.background.default} 0%, ${colors.background.paper} 100%)`,
        boxShadow: `0 0 20px ${colors.primary.main}20`,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        color: colors.text.secondary,
        '&.Mui-selected': {
          color: colors.primary.main,
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        backgroundColor: colors.primary.main,
        boxShadow: `0 0 10px ${colors.primary.main}`,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        backgroundColor: `${colors.primary.main}20`,
        border: `1px solid ${colors.primary.main}40`,
        '&:hover': {
          backgroundColor: `${colors.primary.main}30`,
        },
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        backgroundColor: colors.primary.main,
        boxShadow: `0 0 10px ${colors.primary.main}40`,
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: `${colors.primary.main}10`,
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: `${colors.primary.main}40`,
          },
          '&:hover fieldset': {
            borderColor: `${colors.primary.main}60`,
          },
          '&.Mui-focused fieldset': {
            borderColor: colors.primary.main,
            boxShadow: `0 0 10px ${colors.primary.main}20`,
          },
        },
      },
    },
  },
};

// Create the theme
export const theme = createTheme({
  palette: colors,
  components,
  typography: {
    fontFamily: '"Orbitron", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 8,
  },
}); 