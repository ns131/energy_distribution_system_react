import React, {useEffect} from 'react';
import { NavLink } from 'react-router-dom';
import images from '../assets/images';

function NavBar() {
    useEffect(() => {

    }, []);

    return (
        <div className="nav-bar-main">
            <div className={"nav-bar-left"}>
                <NavLink to='/' className={"nav-link-logo"}>
                    <img
                        src={images.eae_elektrik_logo}
                        width={"100%"}
                        alt="EAE Elektrik">
                    </img>
                </NavLink>
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