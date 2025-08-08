import axios from "axios";

export const loginUser = async (email: string, password: string) => {
  const res = await axios.post("/user/login", { email, password });
  if (res.status !== 200) {
    throw new Error("Unable to login");
  }
  return res.data;
};

export const signupUser = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const res = await axios.post("/user/signup", { name, email, password });
    if (res.status !== 201) {
      throw new Error("Unable to Signup");
    }
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      
      // Display validation errors if they exist
      if (error.response.status === 422 && error.response.data.errors) {
        const firstError = error.response.data.errors[0];
        throw new Error(firstError.msg);
      }
      
      // Display other error messages
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error("Unable to Signup");
  }
};

export const checkAuthStatus = async () => {
  const res = await axios.get("/user/auth-status");
  if (res.status !== 200) {
    throw new Error("Unable to authenticate");
  }
  return res.data;
};

export const sendChatRequest = async (message: string) => {
  try {
    const res = await axios.post("/chat/new", { message });
    if (res.status !== 200) {
      throw new Error("Unable to send chat");
    }
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      
      // Display specific error messages
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error("Unable to send chat");
  }
};

export const getUserChats = async () => {
  try {
    const res = await axios.get("/chat/all-chats");
    if (res.status !== 200) {
      throw new Error("Unable to fetch chats");
    }
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      
      // Display specific error messages
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error("Unable to fetch chats");
  }
};

export const deleteUserChats = async () => {
  try {
    const res = await axios.delete("/chat/delete");
    if (res.status !== 200) {
      throw new Error("Unable to delete chats");
    }
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      
      // Display specific error messages
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error("Unable to delete chats");
  }
};

export const logoutUser = async () => {
  const res = await axios.get("/user/logout");
  if (res.status !== 200) {
    throw new Error("Unable to logout");
  }
  return res.data;
};