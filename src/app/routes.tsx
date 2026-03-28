import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import PitchDetails from "./pages/PitchDetails";
import Bookings from "./pages/Bookings";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import MyReviews from "./pages/MyReviews";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: GuestRoute,
    children: [
      {
        path: "",
        Component: Login,
      },
    ],
  },
  {
    path: "/register",
    Component: GuestRoute,
    children: [
      {
        path: "",
        Component: Register,
      },
    ],
  },
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/pitch/:id",
    Component: ProtectedRoute,
    children: [
      {
        path: "",
        Component: PitchDetails,
      },
    ],
  },
  {
    path: "/bookings",
    Component: ProtectedRoute,
    children: [
      {
        path: "",
        Component: Bookings,
      },
    ],
  },
  {
    path: "/notifications",
    Component: ProtectedRoute,
    children: [
      {
        path: "",
        Component: Notifications,
      },
    ],
  },
  {
    path: "/profile",
    Component: ProtectedRoute,
    children: [
      {
        path: "",
        Component: Profile,
      },
    ],
  },
  {
    path: "/my-reviews",
    Component: ProtectedRoute,
    children: [
      {
        path: "",
        Component: MyReviews,
      },
    ],
  },
  {
    path: "/admin",
    Component: ProtectedRoute,
    children: [
      {
        path: "",
        Component: AdminDashboard,
      },
    ],
  },
]);
