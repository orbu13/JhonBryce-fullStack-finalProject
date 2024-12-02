import { Link } from "react-router-dom";
import { useAuth } from "../../context/authProvider";
import "./navbar.css"
function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">Home Page</Link>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <span>Welcome, {user?.firstName + " " + user?.lastName || "User"}!</span>
            </li>
           {!isAdmin &&  <li>
                <Link to="/vacations">Vacations</Link>
              </li>}
            {isAdmin && (
             
              <li>
                <Link to="/admin-panel">Admin Panel</Link>
              </li>
             
            )}
            <li>
              <button onClick={logout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/loginUser">Login</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
