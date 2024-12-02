import { useAuth } from "../../context/authProvider";
import { Link } from "react-router-dom";

function HomePage() {
        const {isAdmin, isAuthenticated} = useAuth()

  if(isAdmin&&isAuthenticated) {
 return (
    <div>
     <h1>Welcome to home page</h1>
     <Link to="/admin-panel">Admin Panel</Link>
    
    </div>
  );
  }else {
    return <div>
        <h1>Welcome to home page</h1>
      
    </div>
  }

 
}

export default HomePage;
