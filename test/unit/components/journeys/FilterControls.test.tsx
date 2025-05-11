import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterControls } from "../../../../src/components/journeys/FilterControls";

// Mock the Select component from ui/select
vi.mock("../../../../src/components/ui/select", () => ({
    Select: ({ children, value, onValueChange }: any) => (
        <div data-testid="select-mock">
            <span data-testid="select-current-value">{value}</span>
            <button onClick={() => onValueChange("name")}>Change to Name</button>
            <button onClick={() => onValueChange("status")}>Change to Status</button>
            <button onClick={() => onValueChange("date")}>Change to Date</button>
            {children}
        </div>
    ),
    SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
    SelectValue: ({ children, placeholder }: any) => <div data-testid="select-value">{children || placeholder}</div>,
    SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
    SelectItem: ({ children, value }: any) => <div data-testid={`select-item-${value}`}>{children}</div>,
}));

describe("FilterControls", () => {
    const mockOnFilterChange = vi.fn();

    beforeEach(() => {
        mockOnFilterChange.mockClear();
    });
    it("should render with default values", () => {
        render(<FilterControls onFilterChange={mockOnFilterChange} />);

        // Check that input field is empty (using aria-label)
        const searchInput = screen.getByLabelText("Search journeys");
        expect(searchInput).toHaveValue("");

        // Check that default sort option is selected (using testId)
        const selectCurrentValue = screen.getByTestId("select-current-value");
        expect(selectCurrentValue).toHaveTextContent("date");
    });

    it("should call onFilterChange when search query changes", () => {
        render(<FilterControls onFilterChange={mockOnFilterChange} />);

        const searchInput = screen.getByLabelText("Search journeys");
        fireEvent.change(searchInput, { target: { value: "Paris" } });

        expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
        expect(mockOnFilterChange).toHaveBeenCalledWith("Paris", "date");
    });

    it("should call onFilterChange when sort option changes", async () => {
        render(<FilterControls onFilterChange={mockOnFilterChange} />);

        // Use our mocked button to change the sort value
        const changeToNameButton = screen.getByText("Change to Name");
        fireEvent.click(changeToNameButton);

        expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
        expect(mockOnFilterChange).toHaveBeenCalledWith("", "name");
    });

    it("should preserve search query when changing sort option", async () => {
        render(<FilterControls onFilterChange={mockOnFilterChange} />);

        // Set search query first
        const searchInput = screen.getByLabelText("Search journeys");
        fireEvent.change(searchInput, { target: { value: "Paris" } });
        expect(mockOnFilterChange).toHaveBeenCalledWith("Paris", "date");
        mockOnFilterChange.mockClear();

        // Then change sort option - using our mock button directly
        const changeToStatusButton = screen.getByText("Change to Status");
        fireEvent.click(changeToStatusButton);

        expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
        expect(mockOnFilterChange).toHaveBeenCalledWith("Paris", "status");
    });

    it("should preserve sort option when changing search query", () => {
        render(<FilterControls onFilterChange={mockOnFilterChange} />);

        // Change sort option first - using our mock buttons directly
        const changeToNameButton = screen.getByText("Change to Name");
        fireEvent.click(changeToNameButton);
        expect(mockOnFilterChange).toHaveBeenCalledWith("", "name");
        mockOnFilterChange.mockClear();

        // Then set search query
        const searchInput = screen.getByLabelText("Search journeys");
        fireEvent.change(searchInput, { target: { value: "Rome" } });

        expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
        expect(mockOnFilterChange).toHaveBeenCalledWith("Rome", "name");
    });

    it("should have responsive layout with column direction on small screens", () => {
        const { container } = render(<FilterControls onFilterChange={mockOnFilterChange} />);

        // Check that the container has the flex-col class for small screens
        const containerDiv = container.firstChild as HTMLElement;
        expect(containerDiv.className).toContain("flex-col sm:flex-row");
    });
});
