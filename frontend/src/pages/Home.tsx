import { Box, useMediaQuery, useTheme, Button } from "@mui/material";
import React from "react";
import TypingAnimation from "../components/typer/TypingAnimation";
import Footer from "../components/footer/Footer";

const Home = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box width={"100%"} height={"100%"}>
      {/* Header with login/signup buttons */}
      <Box 
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 2,
          width: "100%",
        }}
      >
        <Button 
          variant="outlined" 
          sx={{ mr: 2 }}
          onClick={() => window.location.href = "/login"}
        >
          Login
        </Button>
        <Button 
          variant="contained"
          onClick={() => window.location.href = "/signup"}
        >
          Sign Up
        </Button>
      </Box>
      
      <Box
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          mx: "auto",
          mt: 3,
        }}
      >
        <Box>
          <TypingAnimation />
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: { md: "row", xs: "column", sm: "column" },
            gap: 5,
            my: 10,
          }}
        >
          <img
            src="robott.png"
            alt="robot"
            style={{ width: "200px", margin: "auto" }}
          />
          <img
            className="image-inverted rotate"
            src="gemini.png"
            alt="gemini"
            style={{ width: "200px", margin: "auto" }}
          />
        </Box>
        <Box sx={{ display: "flex", mx: "auto" }}>
          <img
            src="nuclear.jpg"
            alt="chatbot"
            style={{
              display: "flex",
              margin: "auto",
              width: isBelowMd ? "80%" : "60%",
              borderRadius: 20,
              boxShadow: "-5px -5px 105px #64f3d5",
              marginTop: 20,
              marginBottom: 20,
              padding: 10,
            }}
          />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Home;