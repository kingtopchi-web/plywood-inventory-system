import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import ProfilePage from '../pages/profile/ProfilePage';
import SettingsPage from '../pages/settings/SettingsPage';
import HistoryPage from '../pages/history/HistoryPage';

import BranchPage from '../pages/branches/BranchPage';
import CategoryPage from '../pages/categories/CategoryPage';
import SubcategoryPage from '../pages/subcategories/SubcategoryPage';
import BrandPage from '../pages/brands/BrandPage';
import UnitPage from '../pages/units/UnitPage';
import ProductPage from '../pages/products/ProductPage';

import InventoryPage from '../pages/inventory/InventoryPage';
import StockOperationPage from '../pages/inventory/StockOperationPage';
import LowStockPage from '../pages/inventory/LowStockPage';
import OutOfStockPage from '../pages/inventory/OutOfStockPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/admin/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Protected Super Admin Application Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Master Catalog */}
        <Route path="branches" element={<BranchPage />} />
        <Route path="categories" element={<CategoryPage />} />
        <Route path="subcategories" element={<SubcategoryPage />} />
        <Route path="brands" element={<BrandPage />} />
        <Route path="units" element={<UnitPage />} />
        <Route path="products" element={<ProductPage />} />

        {/* Inventory */}
        <Route path="inventory" element={<InventoryPage />} />
        <Route
          path="stock-in"
          element={
            <StockOperationPage
              operationType="STOCK_IN"
              title="Stock In"
              subtitle="Record inbound stock into a branch."
            />
          }
        />
        <Route
          path="stock-out"
          element={
            <StockOperationPage
              operationType="STOCK_OUT"
              title="Stock Out"
              subtitle="Record outbound stock from a branch."
            />
          }
        />
        <Route path="low-stock" element={<LowStockPage />} />
        <Route path="out-of-stock" element={<OutOfStockPage />} />

        {/* Administration */}
        <Route
          path="settings"
          element={<SettingsPage />}
        />
        <Route
          path="profile"
          element={<ProfilePage />}
        />
        <Route
          path="history"
          element={<HistoryPage />}
        />
      </Route>

      {/* Root Redirection */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
