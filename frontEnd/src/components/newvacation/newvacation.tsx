import React, { FormEvent, useState } from "react";
import { z } from "zod";
import { useAuth } from "../../context/authProvider";
import "./newvacation.css";

const newVacationSchema = z.object({
  vacationCode: z
    .string()
    .nonempty("Vacation code is required")
    .max(50, "Vacation code must be less than 50 characters"),
  destination: z
    .string()
    .nonempty("Vacation destination is required")
    .max(100, "Destination must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  startDate: z.preprocess(
    (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : null),
    z.date().refine((date) => date > new Date(), {
      message: "Start date must be in the future",
    })
  ),
  endDate: z.preprocess(
    (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : null),
    z.date()
  ),
  price: z
    .number()
    .min(0, "Price must be at least 0")
    .max(10000, "Price must not exceed 10,000"),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) =>
        !file || ["image/jpeg", "image/png", "image/jpg","image/webp"].includes(file.type),
      {
        message: "Image must be a valid JPEG, webp or PNG file",
      }
    ),
}).superRefine((data, ctx) => {
  if (data.startDate && data.endDate && data.endDate <= data.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "End date must be after the start date",
    });
  }
});

function NewVacation() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [vacationCode, setVacationCode] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescriptions] = useState("");
  const [vacationStartingDate, setVacationStartingDate] = useState("");
  const [vacationEndingDate, setVacationEndingDate] = useState("");
  const [totalPackagePrice, setTotalPackagePrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);

    const validationData = {
      vacationCode,
      destination,
      description,
      startDate: new Date(vacationStartingDate),
      endDate: new Date(vacationEndingDate),
      price: parseFloat(totalPackagePrice),
      image,
    };

    const result = newVacationSchema.safeParse(validationData);

    if (!result.success) {
      setErrors(
        result.error.errors.map((err) => {
          const path = err.path.join(":");
          return `${path}: ${err.message}`;
        })
      );
    } else {
      console.log("else");
      
      const formData = new FormData();
      formData.append("vacationCode", vacationCode);
      formData.append("destination", destination);
      formData.append("description", description);
      formData.append("startDate", vacationStartingDate);
      formData.append("endDate", vacationEndingDate);
      formData.append("price", totalPackagePrice);
      if (image) {
        formData.append("image", image);
      }
console.log(formData);

      fetch("http://localhost:5500/admin/newVacation", {
        method: "POST",
        headers: { loggedIn: isAuthenticated.toString(), role: isAdmin ? "admin" : "" },
        body: formData,
      })
        .then((res) => {
          console.log(res);
          
          if (res.status !== 201) {
            if (res.status === 409) {
              throw new Error("A vacation with the same destination and date already exists.");
            }
            throw new Error("server error");
          }
          return res.json();
        })
        .then((data) => {
          console.log(data);
          
          setSuccess(data.message);
        })
        .catch((err) => {
          console.log(err.message);
          
          setServerError(err.message);
        });
    }
  }

  if (isAdmin && isAuthenticated) {
    return (
      <div className="new-vacation-container">
        <h1>New Vacation</h1>
        <form encType="multipart/form-data" onSubmit={handleSubmit}>
          <label htmlFor="vacationCode">Vacation code:</label>
          <input
            id="vacationCode"
            onChange={(e) => setVacationCode(e.target.value)}
            type="text"
          />
          <br />
          <label htmlFor="destination">Vacation destination:</label>
          <input
            id="destination"
            onChange={(e) => setDestination(e.target.value)}
            type="text"
          />
          <br />
          <label htmlFor="description">Vacation descriptions:</label>
          <textarea
            id="description"
            onChange={(e) => setDescriptions(e.target.value)}
          ></textarea>
          <br />
          <label htmlFor="startDate">Vacation starting date:</label>
          <input
            id="startDate"
            onChange={(e) => setVacationStartingDate(e.target.value)}
            type="date"
          />
          <br />
          <label htmlFor="endDate">Vacation ending date:</label>
          <input
            id="endDate"
            onChange={(e) => setVacationEndingDate(e.target.value)}
            type="date"
          />
          <br />
          <label htmlFor="price">Vacation price:</label>
          <input
            id="price"
            onChange={(e) => setTotalPackagePrice(e.target.value)}
            type="text"
          />
          <br />
          <label htmlFor="image">Upload your image:</label>
          <input
            id="image"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                setImage(file);
              }else {
                setImage(null)
              }
            }}
            type="file"
            accept="image/*"
          />
          <br />
          {errors.length > 0 &&
            errors.map((err, ind) => {
              return <p key={ind}>{err}</p>;
            })}
          {serverError && <p>{serverError}</p>}
          {success && <p>{success}</p>}
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  } else {
    return (
      <div>
        <h1>Welcome to home page</h1>
      </div>
    );
  }
}

export default NewVacation;
