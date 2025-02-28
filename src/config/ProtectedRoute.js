import React from 'react';
import NavBar from '../components/NavBar';

const ProtectedRoute = ({children}) => {
    return (
        <div>
            <div>
                <NavBar />
            </div>

            <div>
                {children}
            </div>
        </div>
    )
}

export default ProtectedRoute;