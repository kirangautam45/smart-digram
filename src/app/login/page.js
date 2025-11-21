"use client";

import React, { useEffect } from "react";
import { Box, Button, Card, Typography } from "@mui/material";
import { Toaster, toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      // Store the token (localStorage, cookie, or your preferred method)
      localStorage.setItem("authToken", token);
      toast.success("Login successful!");

      // Redirect to dashboard with token after successful login
      setTimeout(() => {
        router.push(`/dashboard?token=${token}`);
      }, 1000);
    } else if (error) {
      toast.error("Authentication failed. Please try again.");
    }
  }, [searchParams, router]);

  const handleLogin = () => {
    const redirectUri =
      // "https://smart-diagrams-be.onrender.com/api/linkedin/callback";
        "http://localhost:8090/api/linkedin/callback";

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
      process.env.NEXT_PUBLIC_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=openid%20profile%20email`;

    window.location.href = authUrl;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#ccc",
      }}
    >
      <Toaster />
      <Card
        sx={{
          p: { md: 4, xs: 2 },
          width: { sm: 500, xs: "100%" },
          boxShadow: "none",
          borderRadius: 3,
        }}
      >
        <Box sx={{ fontSize: 32, fontWeight: "bold", mb: 1 }}>Sign In</Box>
        <Typography component="div" sx={{ mb: 1, fontSize: 14 }}>
          Welcome Back. Sign in to get started.
        </Typography>
        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ fontWeight: 600, textTransform: "none" }}
            onClick={handleLogin}
          >
            Continue with LinkedIn
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

export default Page;
