import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, PublicRoute, RoleRoute } from './components/RouteGuards';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddBatch from './pages/AddBatch';
import UpdateStage from './pages/UpdateStage';
import TrackBatch from './pages/TrackBatch';
import BatchDetail from './pages/BatchDetail';
import SpoilageReport from './pages/SpoilageReport';
import BlockchainHistory from './pages/BlockchainHistory';
import QRCodePage from './pages/QRCodePage';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import PublicBatchView from './pages/PublicBatchView';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/public/batch/:batchId" element={<PublicBatchView />} />

          {/* Protected routes wrapped in layout */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/track"          element={<TrackBatch />} />
            <Route path="/batch/:batchId" element={<BatchDetail />} />
            <Route path="/blockchain"     element={<BlockchainHistory />} />
            <Route path="/qrcode"         element={<QRCodePage />} />
            <Route path="/about"          element={<About />} />
            <Route path="/spoilage/report" element={<SpoilageReport />} />

            {/* Farmer + Admin */}
            <Route path="/batch/new" element={
              <RoleRoute roles={['farmer','admin']}><AddBatch /></RoleRoute>
            } />

            {/* Non-farmer supply chain roles + Admin */}
            <Route path="/stage/update" element={
              <RoleRoute roles={['processor','distributor','retailer','admin']}><UpdateStage /></RoleRoute>
            } />

            {/* Admin only */}
            <Route path="/admin" element={
              <RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>
            } />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
