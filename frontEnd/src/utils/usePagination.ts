import { useState } from "react";

function usePagination(data:any, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const goToPage = (page:any) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return {
    currentData,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  };
}

export default usePagination;
