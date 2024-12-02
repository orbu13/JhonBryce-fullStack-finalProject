import { renderHook, act } from "@testing-library/react";
import usePagination from "./usePagination";

describe("usePagination Integration Tests", () => {
  const sampleData = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`); 

  it("initializes with the first page of data", () => {
    const { result } = renderHook(() => usePagination(sampleData, 5));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.currentData).toEqual(sampleData.slice(0, 5));
  });

  it("navigates to the next page", () => {
    const { result } = renderHook(() => usePagination(sampleData, 5));

    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.currentData).toEqual(sampleData.slice(5, 10));
  });

  it("navigates to the previous page", () => {
    const { result } = renderHook(() => usePagination(sampleData, 5));

    act(() => {
      result.current.goToNextPage();
    });

    act(() => {
      result.current.goToPreviousPage();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.currentData).toEqual(sampleData.slice(0, 5));
  });

  it("jumps to a specific page", () => {
    const { result } = renderHook(() => usePagination(sampleData, 5));

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.currentData).toEqual(sampleData.slice(10, 15));
  });

  it("does not navigate past the last page", () => {
    const { result } = renderHook(() => usePagination(sampleData, 5));

    act(() => {
      result.current.goToPage(4);
    });

    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.currentPage).toBe(4);
    expect(result.current.currentData).toEqual(sampleData.slice(15, 20));
  });

  it("does not navigate before the first page", () => {
    const { result } = renderHook(() => usePagination(sampleData, 5));

    act(() => {
      result.current.goToPreviousPage();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.currentData).toEqual(sampleData.slice(0, 5));
  });
});
