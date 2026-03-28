// LoginPage.js (or .tsx)
"use client";
import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useRouter } from "next/navigation"; // Assuming Next.js for navigation

// Define your custom dark blue and white theme for Material-UI
import { loginUser } from "@/services/authService";
import { darkTheme } from "@/components/theme";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/lib/features/auth/authSlice";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // Initialize useRouter for navigation
  const dispatch = useDispatch();

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const role = useSelector((state: any) => state.auth.user?.role);

  const handleTogglePassword = () => setShowPassword((show) => !show);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    if (isSuccess) {
      if (role === "ADMIN") {
        router.push("/admin");
      }
      else if (role === "OFFICER") {
        router.push("/officer");
      } else {
        router.push("/citizen");
      }
    }
  };


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const data = await loginUser({ username, password });

      console.log("Login success:", data);

      // Save user to Redux store
      dispatch(login(data));

      setDialogTitle("Success");
      setDialogMessage("Login Successful!");
      setIsSuccess(true);
      setDialogOpen(true);

    } catch (error: any) {
      console.warn("Login attempt failed:", error.message);
      setDialogTitle("Login Failed");
      setDialogMessage(error.message || "Invalid credentials");
      setIsSuccess(false);
      setDialogOpen(true);
    }
  };



  const handleGoBack = () => {
    // router.back(); // Navigates back to the previous page
    router.push("/")
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Applies global CSS resets and theme-based background */}

      {/* The main container that centers its content */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f111a 60%, #2866f2 100%)',
          padding: { xs: 2, sm: 3 } // Responsive padding with MUI sx
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: { xs: '24px 8px', sm: '40px 32px' },
            maxWidth: '400px',
            width: '100%',
            position: 'relative',
          }}
        >
          <IconButton
            onClick={handleGoBack}
            aria-label="go back"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              color: 'secondary.main',
              '&:hover': {
                color: 'primary.light',
              }
            }}
          >
            <KeyboardBackspaceIcon />
          </IconButton>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <LockOutlinedIcon
              sx={{
                fontSize: '2.8rem',
                color: 'primary.main',
                marginBottom: '8px',
              }}
            />
            <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Sign in to your account
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              margin="normal"
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end" aria-label="toggle password visibility">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>
          </form>
          <Typography variant="body2" align="center" color="textSecondary">
            Don't have an account?{" "}
            <a href="/Register"
              style={{
                color: darkTheme.palette.primary.main,
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              Register
            </a>
          </Typography>
        </Paper>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            {isSuccess ? (
              <CheckCircleOutlineIcon sx={{ fontSize: 60, color: "green", mb: 2 }} />
            ) : (
              <ErrorOutlineIcon sx={{ fontSize: 60, color: "red", mb: 2 }} />
            )}
            <DialogTitle id="alert-dialog-title" sx={{ p: 0, mb: 1 }}>
              {dialogTitle}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description" align="center">
                {dialogMessage}
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ width: '100%', justifyContent: 'center' }}>
              <Button onClick={handleCloseDialog} variant="contained" autoFocus>
                OK
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}