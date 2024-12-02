import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/authProvider";
import { z } from "zod";
import "./editvacationspage.css"

interface Vacation {
  _id: string;
  vacationCode: string;
  destination: string;
  description?: string;
  startDate: string;
  endDate: string;
  price: number;
  image?: File | string | null;
}

const validationSchema = z
  .object({
    description: z
      .string()
      .min(1, { message: "Description is required" })
      .max(500, { message: "Description must be less than 500 characters" }),
    destination: z
      .string()
      .min(1, { message: "Destination is required" })
      .max(100, { message: "Destination must be less than 100 characters" }),
    startDate: z
      .string()
      .refine((date) => new Date(date) > new Date(), {
        message: "Start date must be in the future",
      }),
    endDate: z.string(),
    price: z
      .preprocess((val) => Number(val), z.number().min(0).max(10000))
      .refine((price) => !isNaN(price), { message: "Invalid price format" }),
    image: z.union([z.instanceof(File), z.string(), z.literal(null)]),
    vacationCode: z.string().min(1, { message: "Vacation code is required" }),
  })
  .superRefine((data, ctx) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after the start date",
      });
    }
  });

function EditVacation() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [role, setRole] = useState("");
  const [loggedIn, setLoggedIn] = useState("");
  const [error, setError] = useState<string[]>([]);
  const [serverSuccess, setServerSuccess] = useState("");
  const [serverError, setServerError] = useState("");
  const [preview, setPreview] = useState<string | null>(null); 
  const { id } = useParams();

  const [vacation, setVacation] = useState<Vacation>({
    _id: "",
    description: "",
    destination: "",
    startDate: "",
    endDate: "",
    price: 0,
    image: null,
    vacationCode: "",
  });

  useEffect(() => {
    if (isAdmin) setRole("admin");
    if (isAuthenticated) setLoggedIn("true");
  }, [isAdmin, isAuthenticated]);

  useEffect(() => {
    if (role && loggedIn) {
      fetch(`http://localhost:5500/admin/singleVacation/${id}`, {
        headers: { role, loggedIn },
      })
        .then((res) => res.json())
        .then((data) => {
          setVacation(data.data);
          if (typeof data.data.image === "string") {
            setPreview(`http://localhost:5500/uploads/${data.data.image}`);
          }
        })
        .catch((err) => console.error("Failed to fetch vacation", err));
    }
  }, [role, loggedIn, id]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setVacation({ ...vacation, [event.target.name]: event.target.value });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setVacation({ ...vacation, image: file });

      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError([]);

    const validationResult = validationSchema.safeParse(vacation);

    if (!validationResult.success) {
      setError(
        validationResult.error.errors.map(
          (err) => `${err.path.join(":")}: ${err.message}`
        )
      );
    } else {
      const formData = new FormData();
      for (const key in vacation) {
        const value = vacation[key as keyof typeof vacation];
        if (key === "image" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }

      updateVacation(formData);
    }
  }

  function updateVacation(data: FormData) {
    fetch(`http://localhost:5500/admin/updateVacation/${vacation._id}`, {
      method: "PUT",
      headers: { role, loggedIn },
      body: data,
    })
      .then((res) => res.json())
      .then((response) => {
        setServerSuccess(response.message);
      })
      .catch((error) => console.error("Error updating vacation:", error));
  }

  return (
    <div className="edit-vacation-container">
      <h1>Edit Vacation</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Description:
          <input
            onChange={handleChange}
            name="description"
            value={vacation.description}
          />
        </label>
        <br />
        <label>
          Destination:
          <input
            onChange={handleChange}
            name="destination"
            value={vacation.destination}
          />
        </label>
        <br />
        <label>
          Start date:
          <input
            onChange={handleChange}
            type="date"
            name="startDate"
            value={vacation.startDate}
          />
        </label>
        <br />
        <label>
          End date:
          <input
            onChange={handleChange}
            type="date"
            name="endDate"
            value={vacation.endDate}
          />
        </label>
        <br />
        <label>
          Price:
          <input
            onChange={handleChange}
            name="price"
            type="number"
            value={vacation.price}
          />
        </label>
        <br />
        <label>
          Image:
          <input
            onChange={handleFileChange}
            type="file"
            accept="image/*"
          />
        </label>
        {preview && <img src={preview} alt="Vacation Preview" style={{ width: "50px", height: "50px" }} />}
        <br />
        <label>
          Vacation code:
          <input
            onChange={handleChange}
            name="vacationCode"
            value={vacation.vacationCode}
          />
        </label>
        <br />
        {error.length > 0 &&
          error.map((err, ind) => <p key={ind}>{err}</p>)}
          {serverSuccess&&<p>{serverSuccess}</p>}
          {serverError&&<p>{serverError}</p>}
        <button>Submit</button>
      </form>
      {serverSuccess && <p>{serverSuccess}</p>}
    </div>
  );
}

export default EditVacation;
