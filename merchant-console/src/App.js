import React, { useState, useEffect, useContext } from "react";
import './App.css';
import { Route, Redirect, Routes, useNavigate, useLocation} from 'react-router-dom';
import { SidebarContext } from "./context/SidebarContext.js";
import Router from './pages/nav/Routes.js';
import Navbar from "./pages/nav/Navbar.js";
import Sidebar from "./pages/app/Sidebar.js";

const App = () => {
  const [sidebarState, dispatch] = useContext(SidebarContext);
  const changeDash = (type) => {dispatch({type})};
  let navigate = useNavigate();

  const { pathname } = useLocation();
  const settingsDashPages = ['/settings', '/settings/user','/settings/receipts'];
  const walletDashPages = ['/receipts', '/accounts', '/returns'];

  useEffect(() => {
      if(walletDashPages.includes(pathname)){
        dispatch({type: 'SHOW_BAR'})
        dispatch({type: 'WALLET_BAR'});
      }
      else if(settingsDashPages.includes(pathname)){
        dispatch({type: 'SHOW_BAR'})
        dispatch({type: 'SETTINGS_BAR'});
      }
      else if(pathname === '/'){
        navigate('/receipts')
      } else {
        dispatch({type: 'HIDE_BAR'});
      }
    }, [pathname]);

  return (
      <div className="App">
          <div className="app-container">
            <div className="nav">
              <Navbar/>
            </div>
            <div className="dashboard">
              {sidebarState.visible && (
                <Sidebar/>
              )}
            </div>
            <div className={sidebarState.visible ? "app-content-dashboard" : "app-content"}>
              <Router/>
            </div>
          </div>
      </div>
    );
}

export default App;
