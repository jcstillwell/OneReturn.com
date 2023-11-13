import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Navigate, useNavigate } from "react-router-dom";
import './sidebar.css'
import { SidebarContext } from "../../context/SidebarContext";

const Sidebar = () => {

    const [sidebarState, dispatch] = useContext(SidebarContext);
    let navigate = useNavigate();

    switch(sidebarState.type) {

      case 'SETTINGS_BAR':
        return (
          <div className="menu-container-settings">
            <div className="menu-item" onClick={() => navigate('/settings/user')}>
              <i class="fa-solid fa-user"></i>
              <span className="dash-text">Profile</span>
            </div>
            <div className="menu-item" onClick={() => navigate('/settings/receipts')}>
              <i class="fa-solid fa-receipt"></i>
              <span className="dash-text">Receipt Settings</span>
            </div>
            <div className="menu-item" onClick={() => navigate('/settings')}>
              <i class="fa-solid fa-gears"></i>
              <span className="dash-text">App Settings</span>
            </div>
          </div>
        );
      case 'WALLET_BAR':
        return (
          <div className="menu-container-normal">
            <div className="menu-item" onClick={() => navigate('/wallet')}>
              <i class="fa-solid fa-wallet fa-2xl"></i>
              <span className="dash-text">Wallet</span>
            </div>
            <div className="menu-item" onClick={() => navigate('/shared')}>
              <i class="fa-solid fa-users fa-2xl"></i>
              <span className="dash-text">Shared</span>
            </div>
            <div className="menu-item" onClick={() => navigate('/returns')}>
              <i class="fa-solid fa-arrow-left fa-2xl"></i>
              <span className="dash-text">Returns</span>
            </div>
          </div>
        );
    }
}

export default Sidebar;