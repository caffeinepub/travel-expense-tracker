import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import Layout from './components/Layout';
import TripsPage from './pages/TripsPage';
import ExpensesPage from './pages/ExpensesPage';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TripsPage,
});

const tripsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trips',
  component: TripsPage,
});

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trips/$tripId/expenses',
  component: ExpensesPage,
});

const routeTree = rootRoute.addChildren([indexRoute, tripsRoute, expensesRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
