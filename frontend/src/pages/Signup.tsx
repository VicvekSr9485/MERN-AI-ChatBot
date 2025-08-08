import React, { useEffect } from "react";
import { IoIosLogIn } from "react-icons/io";
import { Box, Typography, Button, List, ListItem, ListItemText } from "@mui/material";
import CustomizedInput from "../components/shared/CustomizedInput";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      toast.loading("Signing Up", { id: "signup" });
      await auth?.signup(name, email, password);
      toast.success("Signed Up Successfully! Please login.", { id: "signup" });
      
      // Redirect to login page after successful signup
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      console.log(error);
      // Display specific error message if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          "Signing Up Failed";
      toast.error(errorMessage, { id: "signup" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already logged in, redirect to chat
  useEffect(() => {
    if (auth?.user) {
      navigate("/chat");
    }
  }, [auth?.user, navigate]);

  return (
    <Box width={"100%"} height={"100%"} display="flex" flex={1}>
      <Box padding={8} mt={8} display={{ md: "flex", sm: "none", xs: "none" }}>
        <img src="airobot.png" alt="Robot" style={{ width: "400px" }} />
      </Box>
      <Box
        display={"flex"}
        flex={{ xs: 1, md: 0.5 }}
        justifyContent={"center"}
        alignItems={"center"}
        padding={2}
        ml={"auto"}
        mt={16}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            margin: "auto",
            padding: "30px",
            boxShadow: "10px 10px 20px #000",
            borderRadius: "10px",
            border: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              padding={2}
              fontWeight={600}
            >
              Signup
            </Typography>
            <CustomizedInput type="text" name="name" label="Full Name" />
            <CustomizedInput type="email" name="email" label="Email" />
            <CustomizedInput type="password" name="password" label="Password" />
            
            {/* Add password requirements */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Password must:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• Be at least 8 characters long" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Include at least one uppercase letter" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Include at least one lowercase letter" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Include at least one number" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Include at least one special character" />
                </ListItem>
              </List>
            </Box>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              sx={{
                px: 2,
                py: 1,
                mt: 2,
                width: "400px",
                borderRadius: 2,
                bgcolor: "#00fffc",
                ":hover": {
                  bgcolor: "white",
                  color: "black",
                },
              }}
              endIcon={<IoIosLogIn />}
            >
              {isSubmitting ? "Signing Up..." : "Signup"}
            </Button>
            
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Already have an account?{" "}
                <Button
                  variant="text"
                  onClick={() => navigate("/login")}
                  sx={{ textTransform: "none", padding: 0, minWidth: "auto" }}
                >
                  Login
                </Button>
              </Typography>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Signup;