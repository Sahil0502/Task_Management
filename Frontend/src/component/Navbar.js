import React, { useState } from 'react';
import './Navbar.css';


const Navbar = () => {
    const [activeItem, setActiveItem] = useState('home');


    const handleNavClick = (item) => {
        setActiveItem(item);
    };


    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-logo">
                    <img src={`${process.env.PUBLIC_URL}/nimble_logo.png`} alt="Nimble Logo" />
                </div>
               
                <ul className="navbar-links">
                    {/* <li className={activeItem === 'home' ? 'active' : ''}>
                        <a href="#home" onClick={() => handleNavClick('home')}>
                            <span className="icon">🏠</span>
                            <span className="text">Home</span>
                        </a>
                    </li> */}
                    <li className={activeItem === 'tasks' ? 'active' : ''}>
                        <a href="#tasks" onClick={() => handleNavClick('tasks')}>
                            <span className="icon">📋</span>
                            <span className="text">Tasks</span>
                        </a>
                    </li>
                    {/* <li className={activeItem === 'reports' ? 'active' : ''}>
                        <a href="#reports" onClick={() => handleNavClick('reports')}>
                            <span className="icon">📊</span>
                            <span className="text">Reports</span>
                        </a>
                    </li> */}
                    {/* <li className={activeItem === 'profile' ? 'active' : ''}>
                        <a href="#profile" onClick={() => handleNavClick('profile')}>
                            <span className="icon">👤</span>
                            <span className="text">Profile</span>
                        </a>
                    </li> */}
                </ul>
               
                {/* <div className="navbar-actions">
                    <button className="btn-notifications">
                        <span className="icon">🔔</span>
                        <span className="badge">3</span>
                    </button>
                    <div className="user-profile">
                        <img src="https://as2.ftcdn.net/jpg/02/59/38/43/1000_F_259384390_LZjy7LNM3zeLSXMILA0NphvmOzUQXSuj.jpg" alt="User Profile" />
                    </div>
                </div> */}
            </div>
        </nav>
    );
};


export default Navbar;








// import React from 'react';
// import './Navbar.css'; // Make sure to create a CSS file for styling
// const Navbar = () => {
//     return (
//         <nav className="navbar">
//             <div className="navbar-logo">
//                 <img src={${process.env.PUBLIC_URL}/nimble_logo.png} alt="Logo" />
//             </div>
//             <ul className="navbar-links">
//                 <li><a href="#home">Home</a></li>
//                 <li><a href="#tasks">Tasks</a></li>
//                 <li><a href="#about">About</a></li>
//                 <li><a href="#profile">Profile</a></li>
//             </ul>
//         </nav>
//     );
// };



