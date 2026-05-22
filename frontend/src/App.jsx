import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuditProvider } from './context/AuditContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import ReportView from './pages/ReportView';
import NotFound from './components/common/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <AuditProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="report/:auditId" element={<ReportView />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuditProvider>
    </ErrorBoundary>
  );
}

export default App;