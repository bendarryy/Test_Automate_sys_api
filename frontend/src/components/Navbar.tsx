import React, { useState } from "react";
import Navstyle from "../styles/Navbar.module.css";
import { Container } from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

interface NavbarProps {
  title: string;
}

const Navbar = ({ title }: NavbarProps) => {
  const [numOfNotification, setNumOfNotification] = useState(2);
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const [isShowNotification, setIsShowNotification] = useState(false);
  return (
    <nav className={Navstyle.navbar}>
      <div className={Navstyle.logo}>
        <RestaurantIcon />
        <div className={Navstyle.title}>{title}</div>
      </div>

      <div className={Navstyle.action}>
        {numOfNotification == 0 && (
          <div className={Navstyle.notification}>
            <div className={Navstyle.notificationIcon}>
              <NotificationsIcon />
            </div>
          </div>
        )}
        {numOfNotification > 0 && (
          <div className={Navstyle.notification}>
            <div className={Navstyle.notificationIcon}>
              <NotificationsActiveIcon />
              <div className={Navstyle.notificationCount}>
                {numOfNotification}
              </div>
            </div>
          </div>
        )}
        <AccountCircleIcon />
      </div>
    </nav>
  );
};

export default Navbar;
