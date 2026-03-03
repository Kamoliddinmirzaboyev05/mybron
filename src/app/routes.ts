import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import PitchDetails from "./pages/PitchDetails";
import Bookings from "./pages/Bookings";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/pitch/:id",
    Component: PitchDetails,
  },
  {
    path: "/bookings",
    Component: Bookings,
  },
  {
    path: "/notifications",
    Component: Notifications,
  },
  {
    path: "/profile",
    Component: Profile,
  },
]);
