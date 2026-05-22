import React from 'react';
import '../../styles/main.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>SYSTOLAB</h1>
            <span className="version">V1</span>
          </div>
          <p className="tagline">Operational Diagnostic Platform</p>
        </div>
      </div>
    </header>
  );
};

export default Header;