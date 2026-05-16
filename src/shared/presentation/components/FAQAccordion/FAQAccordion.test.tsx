import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FAQAccordion, { FAQItem } from "./index";

describe("FAQAccordion Component", () => {
  const mockItems: FAQItem[] = [
    { id: 1, question: "Question 1", answer: "Answer 1" },
    { id: 2, question: "Question 2", answer: "Answer 2" },
  ];

  it("should render all questions", () => {
    render(<FAQAccordion items={mockItems} />);
    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("Question 2")).toBeInTheDocument();
  });

  it("should not show answers by default", () => {
    render(<FAQAccordion items={mockItems} />);
    expect(screen.queryByText("Answer 1")).not.toBeVisible();
    expect(screen.queryByText("Answer 2")).not.toBeVisible();
  });

  it("should show an answer when a question is clicked", async () => {
    const user = userEvent.setup();
    render(<FAQAccordion items={mockItems} />);

    const question1 = screen.getByText("Question 1");
    await user.click(question1);

    expect(await screen.findByText("Answer 1")).toBeVisible();
    expect(screen.queryByText("Answer 2")).not.toBeVisible();
  });

  it("should hide an answer when the same question is clicked again", async () => {
    const user = userEvent.setup();
    render(<FAQAccordion items={mockItems} />);

    const question1 = screen.getByText("Question 1");

    // Open
    await user.click(question1);
    expect(await screen.findByText("Answer 1")).toBeVisible();

    // Close
    await user.click(question1);
    expect(screen.queryByText("Answer 1")).not.toBeVisible();
  });
});
