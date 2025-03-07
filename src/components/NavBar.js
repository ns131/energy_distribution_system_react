import React, {useEffect} from 'react';
import { NavLink } from 'react-router-dom';
import images from '../assets/images';

function NavBar() {

    return (
        <div className="nav-bar-main">
            <div className="nav-bar-logo">
                <NavLink to='/' className={"nav-link-logo"}>
                    <img
                        src={images.eae_elektrik_logo}
                        width={"65px"}
                        alt="EAE Elektrik">
                    </img>
                </NavLink>
            </div>
            <div className={"nav-bar-menu"}>
                <NavLink to={"/"} className={"nav-link-a"}>
                    <div>
                        App
                    </div>
                </NavLink>
                <NavLink to={"/contact"} className={"nav-link-a"}>
                    <div>
                        Contact
                    </div>
                </NavLink>
                <NavLink to={"/about"} className={"nav-link-a"}>
                    <div>
                        About
                    </div>
                </NavLink>
            </div>
        </div>
    )
}

export default NavBar;