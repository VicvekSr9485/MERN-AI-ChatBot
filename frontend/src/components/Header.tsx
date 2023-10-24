import Toolbar from '@mui/material/Toolbar'
import AppBar from '@mui/material/AppBar'
import React from 'react'

const Header = () => {
  return <AppBar sx={{bgcolor: "transparent", position: "static", boxShadow: "none"}}>
      <Toolbar sx={{ display: "flex" }}>Home</Toolbar>
  </AppBar>
}

export default Header
