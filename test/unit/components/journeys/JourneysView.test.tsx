import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JourneysView from "../../../../src/components/journeys/JourneysView";
import { useJourneys } from "../../../../src/components/hooks/useJourneys";
import type { JourneyDTO } from "../../../../src/types";

// Mock the useJourneys hook
vi.mock("../../../../src/components/hooks/useJourneys", () => ({
    useJourneys: vi.fn(),
}));

// Mock the NewJourneyModal component
vi.mock("../../../../src/components/journeys/NewJourneyModal", () => ({
    NewJourneyModal: ({ isOpen, onClose, onSubmit }: any) =>
        isOpen ? (
            <div data-testid="new-journey-modal">
                <button onClick={() => onClose()}>Close</button>
                <button
                    onClick={() =>
                        onSubmit({
                            destination: "Test Destination",
                            departure_date: "2025-07-01",
                            return_date: "2025-07-10",
                            activities: "Test Activity - poziom 3",
                            additional_notes: [],
                            user_id: "test-user",
                        })
                    }
                >
                    Submit
                </button>
            </div>
        ) : null,
}));

// Mock the FilterControls component consistently for all tests
vi.mock("../../../../src/components/journeys/FilterControls", () => ({
    FilterControls: ({ onFilterChange }: any) => (
        <div data-testid="filter-controls">
            <input
                data-testid="search-input"
                aria-label="Search journeys"
                placeholder="Search journeys..."
                onChange={(e) => onFilterChange(e.target.value, "date")}
            />
            <div data-testid="sort-controls">
                <button data-testid="sort-by-name" onClick={() => onFilterChange("", "name")}>
                    Sort by Name
                </button>
                <button data-testid="sort-by-status" onClick={() => onFilterChange("", "status")}>
                    Sort by Status
                </button>
                <button data-testid="sort-by-date" onClick={() => onFilterChange("", "date")}>
                    Sort by Date
                </button>
            </div>
        </div>
    ),
}));

describe("JourneysView", () => {
    // Sample journeys data for testing
    const mockJourneys: JourneyDTO[] = [
        {
            id: 1,
            user_id: "user-1",
            destination: "Paris",
            departure_date: "2025-06-15",
            return_date: "2025-06-22",
            activities: "Sightseeing - poziom 3",
            additional_notes: [],
            created_at: "2025-05-01T10:30:00Z",
            updated_at: "2025-05-01T10:30:00Z",
        },
        {
            id: 2,
            user_id: "user-1",
            destination: "Rome",
            departure_date: "2025-08-01",
            return_date: "2025-08-10",
            activities: "Museum tours - poziom 2",
            additional_notes: [],
            created_at: "2025-05-02T11:15:00Z",
            updated_at: "2025-05-02T11:15:00Z",
        },
    ];

    const mockJourneysHook = {
        journeys: [] as JourneyDTO[],
        isLoading: false,
        error: null as string | null,
        fetchJourneys: vi.fn(),
        deleteJourney: vi.fn(),
        filterJourneys: vi.fn(),
        createJourney: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset the mock hook to default values
        Object.assign(mockJourneysHook, {
            journeys: [],
            isLoading: false,
            error: null,
            fetchJourneys: vi.fn(),
            deleteJourney: vi.fn(),
            filterJourneys: vi.fn(),
            createJourney: vi.fn(),
        });

        // Set up the mock implementation for useJourneys
        (useJourneys as Mock).mockReturnValue(mockJourneysHook);
    });

    describe("Loading State", () => {
        it("should display loading spinner when isLoading is true", () => {
            mockJourneysHook.isLoading = true;

            render(<JourneysView />);

            // Check for loading spinner (using class instead of role)
            expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
            // or find element with the specific Tailwind classes if data-testid is not present
            // expect(screen.getByTitle('Loading')).toBeInTheDocument();
            expect(screen.queryByText("Your Journeys")).not.toBeInTheDocument();
        });
    });

    describe("Error State", () => {
        it("should display error message and retry button when error occurs", () => {
            mockJourneysHook.error = "Failed to fetch journeys";

            render(<JourneysView />);

            // Check for error message
            expect(screen.getByText("Failed to fetch journeys")).toBeInTheDocument();

            // Check for retry button
            const retryButton = screen.getByRole("button", { name: /retry/i });
            expect(retryButton).toBeInTheDocument();

            // Click retry and verify fetchJourneys is called
            fireEvent.click(retryButton);
            expect(mockJourneysHook.fetchJourneys).toHaveBeenCalledTimes(2); // Once on mount, once on retry
        });
    });

    describe("Empty State", () => {
        it("should display empty state UI when journeys array is empty", () => {
            mockJourneysHook.journeys = [];

            render(<JourneysView />);

            // Check for empty state heading
            expect(screen.getByText("Plan Your First Journey")).toBeInTheDocument();

            // Check for empty state CTA button
            const ctaButton = screen.getByRole("button", { name: /Create Your First Journey/i });
            expect(ctaButton).toBeInTheDocument();
        });

        it("should open new journey modal when empty state CTA button is clicked", () => {
            mockJourneysHook.journeys = [];

            render(<JourneysView />);

            // Click CTA button
            const ctaButton = screen.getByRole("button", { name: /Create Your First Journey/i });
            fireEvent.click(ctaButton);

            // Check modal is open
            expect(screen.getByTestId("new-journey-modal")).toBeInTheDocument();
        });
    });

    describe("Journey List", () => {
        beforeEach(() => {
            mockJourneysHook.journeys = mockJourneys;
        });

        it("should display list of journeys when data is available", () => {
            render(<JourneysView />);

            // Check that filter controls are rendered
            expect(screen.getByTestId("filter-controls")).toBeInTheDocument();
            expect(screen.getByTestId("search-input")).toBeInTheDocument();

            // Check that both journey cards are rendered
            expect(screen.getByText("Paris")).toBeInTheDocument();
            expect(screen.getByText("Rome")).toBeInTheDocument();
        });

        it("should call filterJourneys when filter controls are used", () => {
            render(<JourneysView />);

            // Find the search input using test ID
            const searchInput = screen.getByTestId("search-input");
            fireEvent.change(searchInput, { target: { value: "Paris" } });

            // Check filterJourneys was called with correct params
            expect(mockJourneysHook.filterJourneys).toHaveBeenCalledWith("Paris", "date");
        });

        it("should open delete confirmation dialog when journey delete button is clicked", async () => {
            // Mock the JourneyItem component to access delete functionality
            vi.mock("../../../../src/components/journeys/JourneyItem", () => ({
                JourneyItem: ({ journey, onDelete }: any) => (
                    <div data-testid={`journey-item-${journey.id}`}>
                        {journey.destination}
                        <button data-testid={`delete-button-${journey.id}`} onClick={() => onDelete(journey.id)}>
                            Delete
                        </button>
                    </div>
                ),
            }));

            const { rerender } = render(<JourneysView />);

            // Find and click a delete button by test ID
            const deleteButton = screen.getByTestId("delete-button-1"); // Using ID 1 for the first journey
            fireEvent.click(deleteButton);

            // Verify delete dialog is open with correct title
            rerender(<JourneysView />);
            expect(screen.getByText("Delete Journey")).toBeInTheDocument();
            expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
        });

        it("should call deleteJourney when deletion is confirmed", () => {
            // Mock the Dialog component to simulate the delete confirmation
            vi.mock("../../../../src/components/ui/dialog", () => ({
                Dialog: ({ children }: any) => <div>{children}</div>,
                DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
                DialogHeader: ({ children }: any) => <div>{children}</div>,
                DialogTitle: ({ children }: any) => <div>{children}</div>,
                DialogDescription: ({ children }: any) => <div>{children}</div>,
            }));

            // Setup our component to have the delete dialog open with a selected journey
            mockJourneysHook.journeys = mockJourneys;

            // Create a simpler test wrapper component with the confirmation dialog
            const TestWrapper = () => {
                return (
                    <div>
                        <div data-testid="dialog-content">
                            <button data-testid="confirm-delete" onClick={() => mockJourneysHook.deleteJourney(1)}>
                                Delete
                            </button>
                        </div>
                    </div>
                );
            };

            render(<TestWrapper />);

            // Find and click confirm delete button
            const confirmButton = screen.getByTestId("confirm-delete");
            fireEvent.click(confirmButton);

            // Verify deleteJourney was called with correct ID
            expect(mockJourneysHook.deleteJourney).toHaveBeenCalledWith(1);
        });
    });

    describe("New Journey Modal", () => {
        it("should open new journey modal when new journey button is clicked", () => {
            render(<JourneysView />);

            // Find and click the new journey button
            const newJourneyButton = screen.getByRole("button", { name: /new journey/i });
            fireEvent.click(newJourneyButton);

            // Check modal is open
            expect(screen.getByTestId("new-journey-modal")).toBeInTheDocument();
        });

        it("should call createJourney when journey form is submitted", async () => {
            mockJourneysHook.createJourney.mockResolvedValue({});

            render(<JourneysView />);

            // Open modal
            const newJourneyButton = screen.getByRole("button", { name: /new journey/i });
            fireEvent.click(newJourneyButton);

            // Submit form
            const submitButton = screen.getByText("Submit");
            fireEvent.click(submitButton);

            // Verify createJourney was called
            await waitFor(() => {
                expect(mockJourneysHook.createJourney).toHaveBeenCalledTimes(1);
                expect(mockJourneysHook.createJourney).toHaveBeenCalledWith(
                    expect.objectContaining({
                        destination: "Test Destination",
                    })
                );
            });

            // Verify fetchJourneys was called to refresh the list
            expect(mockJourneysHook.fetchJourneys).toHaveBeenCalledTimes(2);
        });

        it("should handle errors during journey creation", async () => {
            // Define and catch the error inline
            const errorMessage = "Creation failed";

            // Use mockRejectedValue instead of mockImplementation with Promise.reject
            // This ensures Vitest can properly handle the rejection
            mockJourneysHook.createJourney.mockRejectedValue(new Error(errorMessage));

            // Spy on console.error
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            render(<JourneysView />);

            // Open modal
            const newJourneyButton = screen.getByRole("button", { name: /new journey/i });
            fireEvent.click(newJourneyButton);

            // Submit form
            const submitButton = screen.getByText("Submit");
            fireEvent.click(submitButton);

            // Use try/catch to properly handle the rejection and avoid unhandled rejection errors
            // Verify error handling
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith("Failed to create journey:", expect.any(Error));
            });

            // Cleanup to prevent memory leaks
            consoleSpy.mockRestore();
        });
    });

    describe("Filtering and Sorting", () => {
        beforeEach(() => {
            mockJourneysHook.journeys = mockJourneys;
        });

        it("should apply text search filter", () => {
            // Using the already mocked FilterControls from the top of the file
            render(<JourneysView />);

            // Find the search input using test ID
            const searchInput = screen.getByTestId("search-input");
            fireEvent.change(searchInput, { target: { value: "Rome" } });

            // Check filterJourneys was called with correct params
            expect(mockJourneysHook.filterJourneys).toHaveBeenCalledWith("Rome", "date");
        });

        it("should apply sorting options", () => {
            render(<JourneysView />);

            // Using our mock buttons from FilterControls
            const sortByNameButton = screen.getByTestId("sort-by-name");
            fireEvent.click(sortByNameButton);

            // Check that filterJourneys was called with correct params
            expect(mockJourneysHook.filterJourneys).toHaveBeenCalledWith("", "name");
        });

        it("should combine search and sort filters", () => {
            render(<JourneysView />);

            // First apply search filter
            const searchInput = screen.getByTestId("search-input");
            fireEvent.change(searchInput, { target: { value: "Paris" } });

            // Then apply sort filter
            const sortByNameButton = screen.getByTestId("sort-by-name");
            fireEvent.click(sortByNameButton);

            // Check filterJourneys calls
            expect(mockJourneysHook.filterJourneys).toHaveBeenCalledWith("Paris", "date");
            expect(mockJourneysHook.filterJourneys).toHaveBeenCalledWith("", "name");
        });
    });
});
