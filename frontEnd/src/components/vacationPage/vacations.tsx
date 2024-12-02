import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePagination from "../../utils/usePagination";
import { useAuth } from "../../context/authProvider";
import { toast, ToastOptions } from "react-toastify";
import DeleteModal from "../deletevacationmodal/deletevacationmodal";
import "./vacations.css"
interface Vacation {
  _id: string;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  image?: string;
  followers: string[];
}

const showNotification = (
  message: string,
  type: "success" | "error" | "info" | "warning",
  options?: ToastOptions
) => {
  switch (type) {
    case "success":
      toast.success(message, options);
      break;
    case "error":
      toast.error(message, options);
      break;
    case "info":
      toast.info(message, options);
      break;
    case "warning":
      toast.warn(message, options);
      break;
    default:
      toast(message, options);
  }
};

function VacationPage() {
  const [selectedVacation, setSelectedVacation] = useState<Vacation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [filteredVacations, setFilteredVacations] = useState<Vacation[]>([]);
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const { isAdmin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    destination: "",
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: "",
    futureVacations: false,
    activeVacations: false,
  });

  const {
    currentData: paginatedVacations,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
  } = usePagination(filteredVacations);

  useEffect(() => {
  if (isAuthenticated) {
    const url = isAdmin
      ? "http://localhost:5500/admin/vacations"
      : "http://localhost:5500/users/vacations";
    fetch(url, {
      headers: {
        loggedIn: isAuthenticated.toString(),
        role: isAdmin ? "admin" : "user",
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          setError("Could not fetch vacations");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        const sortedVacations = data.data.sort(
          (a: Vacation, b: Vacation) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        setVacations(sortedVacations);
        setFilteredVacations(sortedVacations);
      })
      .catch((err)=>[
        setServerError(err.message)
      ])
  }
}, [isAuthenticated, isAdmin]);


  const handleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;

    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const applyFilters = () => {
    const filtered = vacations.filter((vacation: Vacation) => {
      const withinDestination =
        filters.destination === "" ||
        vacation.destination
          .toLowerCase()
          .includes(filters.destination.toLowerCase());

      const withinPrice =
        (!filters.minPrice || vacation.price >= Number(filters.minPrice)) &&
        (!filters.maxPrice || vacation.price <= Number(filters.maxPrice));

      const withinDate =
        (!filters.startDate ||
          new Date(vacation.startDate) >= new Date(filters.startDate)) &&
        (!filters.endDate ||
          new Date(vacation.endDate) <= new Date(filters.endDate));

      const isFutureVacation =
        filters.futureVacations && new Date(vacation.startDate) > new Date();

      const isActiveVacation =
        filters.activeVacations &&
        new Date(vacation.startDate) <= new Date() &&
        new Date(vacation.endDate) >= new Date();

      return (
        withinDestination &&
        withinPrice &&
        withinDate &&
        (!filters.futureVacations || isFutureVacation) &&
        (!filters.activeVacations || isActiveVacation)
      );
    });

    setFilteredVacations(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, vacations]);

  const followVacation = (vacation: Vacation) => {
    fetch(`http://localhost:5500/users/follow-vacation/${vacation._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        loggedIn: isAuthenticated.toString(),
        role: user?.role === "user" ? "user" : ""
      },
      body: JSON.stringify({ user: { id: user?._id } }),
    })
      .then((res) => res.json())
      .then((data) => {
        showNotification(data.message, "success");
        setVacations((prev) =>
          prev.map((v) =>
            v._id === vacation._id
              ? { ...v, followers: [...v.followers, user?._id || ""] }
              : v
          )
        );
      })
      .catch((err) => {
        setServerError(err.message);
      });
  };

  const unfollowVacation = (vacation: Vacation) => {
    fetch(`http://localhost:5500/users/unfollow-vacation/${vacation._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        loggedIn: isAuthenticated.toString(),
        role: user?.role === "user" ? "user" : ""
      },
      body: JSON.stringify({ user: { id: user?._id } }),
    })
      .then((res) => res.json())
      .then((data) => {
        showNotification(data.message, "success");
        setVacations((prev) =>
          prev.map((v) =>
            v._id === vacation._id
              ? {
                  ...v,
                  followers: v.followers.filter(
                    (followerId) => followerId !== user?._id
                  ),
                }
              : v
          )
        );
      })
      .catch((err) => {
        setServerError(err.message);
      });
  };

  const openModal = (vacation: Vacation) => {
    setSelectedVacation(vacation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedVacation(null);
    setIsModalOpen(false);
  };

   const handleDelete = () => {
    if (!selectedVacation) return;

    fetch(`http://localhost:5500/admin/delete-vacation/${selectedVacation._id}`, {
      method: "DELETE",
      headers: { loggedIn: isAuthenticated.toString(), role: isAdmin? "admin": ""},
    })
      .then((res) => {
        if (res.status === 200) {
          setVacations((prev) =>
            prev.filter((vac) => vac._id !== selectedVacation._id)
          );
          toast.success("Vacation deleted successfully!");
        } else {
          toast.error("Failed to delete vacation.");
        }
        closeModal();
      })
      .catch((err) => {
        toast.error("An error occurred.");
        closeModal();
      });
  };

  const renderVacation = (vacation: Vacation) => (
    
    <div style={{ border: "1px solid black" }} key={vacation._id}>
      <h3>{vacation.destination}</h3>
      <img
        src={`http://localhost:5500/uploads/${vacation.image}`}
        width={200}
        height={200}
        alt=""
      />
      <p>{vacation.description}</p>
      <p>
        Vacation dates:{" "}
        {new Date(vacation.startDate).toLocaleDateString()} -{" "}
        {new Date(vacation.endDate).toLocaleDateString()}
      </p>
      <p>Price: ${vacation.price}</p>
      <p>{vacation.followers.length} {vacation.followers.length>1  ? "followers" : "follower"}</p>
      {user && vacation.followers.includes(user._id)? <p>you are following this vacation</p> : <p>you are not following this vacation</p>}
      {isAdmin && (
        <>
        <button
          onClick={() => {
            navigate(`/edit-vacation/${vacation._id}`);
          }}
        >
          Edit
        </button>
        <br />
        <button onClick={()=>openModal(vacation)}>delete</button>
         <DeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleDelete}
        vacationName={selectedVacation?.destination}
      />
        </>
      )}
      {!isAdmin &&
        (vacation.followers.includes(user?._id || "") ? (
          <button onClick={() => unfollowVacation(vacation)}>Unfollow</button>
        ) : (
          <button onClick={() => followVacation(vacation)}>Follow</button>
        ))}
    </div>
  );
  useEffect(()=>{
if(!isAuthenticated) {
  setTimeout(()=>{
    navigate("/loginUser")
  },1000)
}
  },[isAuthenticated])

  if (!isAuthenticated) {
    return <h1>Not logged in</h1>;
  }

  return (
    <div className="vacations-container">
      {isAdmin&& <button onClick={()=> navigate("/new-vacation")}>Add New Vacation</button>}
      {serverError&& <p>{serverError}</p>}
      {/* <ToastContainer /> */}
      <h1>{filteredVacations.length || vacations.length} Vacations</h1>
      <div>
        <label>
          Destination:
          <input
            type="text"
            name="destination"
            value={filters.destination}
            onChange={handleFilterChange}
          />
        </label>
        <br />
        <label>
          Min Price:
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
        </label>
        <br />
        <label>
          Max Price:
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </label>
        <br />
        <label>
          Start Date:
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </label>
        <br />
        <label>
          End Date:
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </label>
        <br />
        <label>
          Show Future Vacations:
          <input
            type="checkbox"
            name="futureVacations"
            checked={filters.futureVacations}
            onChange={handleFilterChange}
          />
        </label>
        <br />
        <label>
          Show Active Vacations:
          <input
            type="checkbox"
            name="activeVacations"
            checked={filters.activeVacations}
            onChange={handleFilterChange}
          />
        </label>
        <br />
        <button onClick={applyFilters}>Apply Filters</button>
      </div>

      {paginatedVacations.map(renderVacation)}
      {error && <p>{error}</p>}
      <div style={{ marginTop: "20px" }}>
        <button disabled={currentPage === 1} onClick={goToPreviousPage}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={goToNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default VacationPage;
