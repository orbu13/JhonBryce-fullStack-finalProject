import { renderHook, act } from "@testing-library/react";
import usePagination from "./usePagination";

describe("usePagination", () => {
  const sampleData = Array.from({ length: 25 }, (_, index) => `Item ${index + 1}`); 
  it("initializes with the correct default values", () => {
    const { result } = renderHook(() => usePagination(sampleData, 10));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3); 
    expect(result.current.currentData).toEqual(sampleData.slice(0, 10)); 
  });

  it("navigates to the next page", () => {
    const { result } = renderHook(() => usePagination(sampleData, 10));

    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.currentData).toEqual(sampleData.slice(10, 20)); 
  });

  
  it("does not navigate before the first page", () => {
    const { result } = renderHook(() => usePagination(sampleData, 10));

    act(() => {
      result.current.goToPreviousPage(); 
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.currentData).toEqual(sampleData.slice(0, 10)); 
  });

  it("jumps to a specific page", () => {
    const { result } = renderHook(() => usePagination(sampleData, 10));

    act(() => {
      result.current.goToPage(3); 
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.currentData).toEqual(sampleData.slice(20, 25)); 
  });

  it("does not jump to an invalid page", () => {
    const { result } = renderHook(() => usePagination(sampleData, 10));

    act(() => {
      result.current.goToPage(0);
    });

    expect(result.current.currentPage).toBe(1); 

    act(() => {
      result.current.goToPage(4); 
    });

    expect(result.current.currentPage).toBe(1); 
  });
});
