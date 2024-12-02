import { useState,useEffect } from "react";
import { z } from "zod";
import { useAuth } from "../../context/authProvider";
import { useNavigate } from "react-router-dom";
import "./login.css"

function LoginUser() {
  const userValidationSchema = z.object({
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .min(1, { message: "Valid email address is required" }),
    password: z
      .string()
      .min(4, { message: "Password must be longer than 4 characters" })
      .max(15, { message: "Password must be shorter than 15 characters" }),
      role: z.string().min(4, {message: 'Please chose role'}).max(5, {message: 'Please chose role'})
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<Array<{ field: string; message: string }>>([]);
  const [loginError, setLoginError] = useState('');
  const [success, setSuccess] = useState('')
  const {login,isAuthenticated} = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const userInfo = {email: email, password: password, role:role };
    const validationResult = userValidationSchema.safeParse(userInfo);

    if (!validationResult.success) {
      setError(
        validationResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }))
      );
    } else {
      setError([]); 
      if(role === 'user'){
        loginUser(userInfo)
      }else if(role === 'admin'){
        loginAdmin(userInfo)
        
      }
    }
  }

  function loginUser(info:object){
    fetch('http://localhost:5500/users/login', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(info)
    })
    .then((res)=>{
        if(res.status === 400){
            setLoginError('Email or password is incorrect')
            throw new Error ('Invalid login')
        }else{
            return res.json()
        }
    })
    .then((data)=>{
        login(data.user)
        setSuccess(data.message)
        setLoginError('')
        setError([])
    })
    .catch((error)=>{
        setLoginError(error.message)
        setSuccess('')
    })
  }

  function loginAdmin(info:object){
    fetch('http://localhost:5500/admin/login', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(info)
    })
    .then((res)=>{
        if(res.status === 400){
            setLoginError('Email or password is incorrect')
            throw new Error ('Invalid login')
        }else{
            return res.json()
        }
    })
    .then((data)=>{
        login(data.user)
        setSuccess(data.message)
        setLoginError('')
        setError([])
    })
    .catch((error)=>{
        setLoginError(error.message)
        setSuccess('')
    })
  }

  useEffect(()=>{
    if(isAuthenticated) {
     setTimeout(()=>{
       navigate("/vacations")
     },1000)
    }
  },[isAuthenticated])
  if(!isAuthenticated) {
    
  return (
    <div className="login-container">
      <h1>Log in Here</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <br />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <br />
        <label htmlFor="role-user">
          <input
            id="role-user"
            type="radio"
            checked={role === "user"}
            onChange={() => {
              setRole("user");
            }}
          />
          User
        </label>
        <br />
        <label htmlFor="role-admin">
          <input
            id="role-admin"
            type="radio"
            checked={role === "admin"}
            onChange={() => {
              setRole("admin");
            }}
          />
          Admin
        </label>
        <br />
        <p>Selected Role: {role}</p>
        <button type="submit">Login</button>
      </form>
      {loginError && <p>{loginError}</p>}
      {success && <p>{success}</p>}
      {error.length > 0 && (
        <div>
          <h3>Errors:</h3>
          <ul>
            {error.map((err, index) => (
              <li key={index}>
                {err.field}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} else {
  return <div>
    <h1>you are logged in</h1>
    {<p>{success}</p>}</div>
}
}

export default LoginUser;
