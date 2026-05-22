import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuditProvider } from './context/AuditContext';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import ReportView from './pages/ReportView';

function App() {
  return (
    <AuditProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="report/:auditId" element={<ReportView />} />
          </Route>
        </Routes>
      </Router>
    </AuditProvider>
  );
}

export default App;