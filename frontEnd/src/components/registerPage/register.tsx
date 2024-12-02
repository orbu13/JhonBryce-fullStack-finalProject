import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authProvider";
import { z } from "zod";
import "./register.css";

function Register() {
  const userValidationSchema = z.object({
    firstName: z
      .string()
      .min(4, { message: "First name must be longer than 4 characters" })
      .max(10, { message: "First name must be shorter than 10 characters" }),
    lastName: z
      .string()
      .min(4, { message: "Last name must be longer than 4 characters" })
      .max(10, { message: "Last name must be shorter than 10 characters" }),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .min(1, { message: "Valid email address is required" }),
    password: z
      .string()
      .min(4, { message: "Password must be longer than 4 characters" })
      .max(15, { message: "Password must be shorter than 15 characters" }),
  });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Array<{ field: string; message: string }>>(
    []
  );
  const [existingEmail, setExistingEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const {login} = useAuth()
  const navigate = useNavigate();

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    const newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    };
    const validationResult = userValidationSchema.safeParse(newUser);
    if (validationResult.error) {
      setError(
        validationResult.error.errors.map((err) => {
          return {
            field: err.path.join("."),
            message: err.message,
          };
        })
      );
    } else {
      fetch("http://localhost:5500/users/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newUser),
      })
        .then((res) => {
          if (res.status === 409) {
            setExistingEmail("This email is registered");
          } else {
            return res.json();
          }
        })
        .then((data) => {
          login(data.data)
          setSuccessMessage(data.message);
          setExistingEmail("");
        })
        .catch((err) => {
          console.log(err)
          setServerError(err.message);
        });
    }
  }
  useEffect(() => {
    setTimeout(() => {
      if (successMessage) {
        navigate("/vacations");
      }
    }, 1000);
  }, [successMessage]);

  return (
    <div className="register-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="firstName">First name:</label>
        <input
          id="firstName"
          type="text"
          onChange={(e) => {
            setFirstName(e.target.value);
          }}
        />
        <br />

        <label htmlFor="lastName">Last name:</label>
        <input
          id="lastName"
          type="text"
          onChange={(e) => {
            setLastName(e.target.value);
          }}
        />
        <br />

        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="text"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <br />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="text"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <br />

        {error.length > 0 && (
          <div>
            {error.map((err) => {
              return <p key={err.field}>{err.message}</p>;
            })}
          </div>
        )}

        {existingEmail && <p>{existingEmail}</p>}
        {successMessage && <p>{successMessage}</p>}
        <br />
        <br />
        {serverError && <p>{serverError}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Register;
