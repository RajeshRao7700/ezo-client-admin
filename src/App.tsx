import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Context Providers */
import { AuthProvider, useAdminAuth } from './context/AuthContext';
import { AdminDataProvider } from './context/AdminDataContext';

/* Layout Shell */
import { AdminLayout } from './components/layout/AdminLayout';

/* Auth Pages */
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

/* Main Application Pages */
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { SalesMonitoringPage } from './pages/sales/SalesMonitoringPage';
import { InventoryMonitoringPage } from './pages/inventory/InventoryMonitoringPage';
import { EmployeeManagementPage } from './pages/employees/EmployeeManagementPage';
import { ReportsAnalyticsPage } from './pages/reports/ReportsAnalyticsPage';
import { BusinessSettingsPage } from './pages/settings/BusinessSettingsPage';
import { SubscriptionPage } from './pages/subscription/SubscriptionPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { ActivityLogsPage } from './pages/activity/ActivityLogsPage';
import { ProfilePage } from './pages/profile/ProfilePage';

/* Setup Ionic with Material Design default */
setupIonicReact({
  mode: 'md',
  animated: false,
});

/**
 * Route wrapper that renders authenticated routes within AdminLayout
 */
const ProtectedAdminRoute: React.FC<{
  path: string;
  exact?: boolean;
  component: React.ComponentType<any>;
}> = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useAdminAuth();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <AdminLayout>
            <Component {...props} />
          </AdminLayout>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Switch>
      {/* Public Authentication Routes */}
      <Route path="/login" exact component={LoginPage} />
      <Route path="/forgot-password" exact component={ForgotPasswordPage} />
      <Route path="/reset-password" exact component={ResetPasswordPage} />

      {/* Protected Admin Routes */}
      <ProtectedAdminRoute path="/dashboard" exact component={DashboardPage} />
      <ProtectedAdminRoute path="/sales" exact component={SalesMonitoringPage} />
      <ProtectedAdminRoute path="/inventory" exact component={InventoryMonitoringPage} />
      <ProtectedAdminRoute path="/employees" exact component={EmployeeManagementPage} />
      <ProtectedAdminRoute path="/reports" exact component={ReportsAnalyticsPage} />
      <ProtectedAdminRoute path="/settings" exact component={BusinessSettingsPage} />
      <ProtectedAdminRoute path="/subscription" exact component={SubscriptionPage} />
      <ProtectedAdminRoute path="/notifications" exact component={NotificationsPage} />
      <ProtectedAdminRoute path="/activity" exact component={ActivityLogsPage} />
      <ProtectedAdminRoute path="/profile" exact component={ProfilePage} />

      {/* Default Fallback / Redirect */}
      <Route exact path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="*">
        <Redirect to="/dashboard" />
      </Route>
    </Switch>
  );
};

export const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <AdminDataProvider>
          <IonReactRouter>
            <AppRoutes />
          </IonReactRouter>
        </AdminDataProvider>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
