import { Link } from "react-router-dom";
import "./adminpanel.css"
function AdminPanel() {
  return (
    <div className="admin-panel-container">
      <h1>Admin Panel</h1>
      <nav>
        <ul>
          <li>
            <Link to="/vacations">Manage Vacations</Link>
          </li>
          <li>
            <Link to="/new-vacation">Add New Vacation</Link>
          </li>
          <li>
            <Link to="/reports">Vacation Reports</Link>
          </li>
        
        </ul>
      </nav>
    </div>
  );
}

export default AdminPanel;
