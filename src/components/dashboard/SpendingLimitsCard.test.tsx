import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SpendingLimitsCard } from "./SpendingLimitsCard";

describe("SpendingLimitsCard", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		window.localStorage.clear();
	});

	it("renders the card title and description", () => {
		render(<SpendingLimitsCard />);

		expect(
			screen.getByRole("heading", { name: /spending limits/i }),
		).toBeInTheDocument();
		expect(
			screen.getByText(/control your api expenditure/i),
		).toBeInTheDocument();
	});

	it("renders the Active badge and default usage", () => {
		render(<SpendingLimitsCard />);

		expect(screen.getByText("Active")).toBeInTheDocument();
		expect(screen.getByText("$750")).toBeInTheDocument();
		expect(screen.getByText("/ $5000")).toBeInTheDocument();
		expect(screen.getByText("15.0%")).toBeInTheDocument();
	});

	it("renders inputs with defaults and Save button", () => {
		render(<SpendingLimitsCard />);

		const dailyInput = screen.getByRole("spinbutton", {
			name: /daily spending limit/i,
		});
		const txInput = screen.getByRole("spinbutton", {
			name: /per-transaction limit/i,
		});

		expect(dailyInput).toHaveValue(5000);
		expect(txInput).toHaveValue(1000);
		expect(
			screen.getByRole("button", { name: /save settings/i }),
		).toBeInTheDocument();
	});

	it("shows a toast after saving spending limits", async () => {
		render(<SpendingLimitsCard />);

		const user = userEvent.setup();
		await user.click(screen.getByRole("button", { name: /save settings/i }));

		expect(await screen.findByText(/spending limits saved/i)).toBeTruthy();

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 3100));
		});

		expect(screen.queryByText(/spending limits saved/i)).toBeNull();
	});

	it("shows an error when saving fails", async () => {
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("Storage failed");
		});

		render(<SpendingLimitsCard />);

		const user = userEvent.setup();
		await user.click(screen.getByRole("button", { name: /save settings/i }));

		expect(
			await screen.findByText(/unable to save spending limits/i),
		).toBeTruthy();
	});

	it("persists saved values to localStorage", async () => {
		render(<SpendingLimitsCard />);

		const user = userEvent.setup();
		const dailyInput = screen.getByLabelText(/daily spending limit/i);
		await user.clear(dailyInput);
		await user.type(dailyInput, "7500");

		const txInput = screen.getByLabelText(/per-transaction limit/i);
		await user.clear(txInput);
		await user.type(txInput, "1250");

		await user.click(screen.getByRole("button", { name: /save settings/i }));

		expect(window.localStorage.getItem("spending-limits")).toContain(
			'"dailyLimit":7500',
		);
		expect(window.localStorage.getItem("spending-limits")).toContain(
			'"transactionLimit":1250',
		);
	});

	it("loads persisted values from localStorage on mount", async () => {
		window.localStorage.setItem(
			"spending-limits",
			JSON.stringify({ dailyLimit: 10000, transactionLimit: 2000 }),
		);

		render(<SpendingLimitsCard />);

		const dailyInput = screen.getByLabelText(
			/daily spending limit/i,
		) as HTMLInputElement;
		const txInput = screen.getByLabelText(
			/per-transaction limit/i,
		) as HTMLInputElement;

		expect(dailyInput.value).toBe("10000");
		expect(txInput.value).toBe("2000");
	});
});
