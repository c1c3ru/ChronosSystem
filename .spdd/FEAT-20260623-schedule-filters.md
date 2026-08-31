# REASONS Canvas: Schedule Grid Advanced Filters

## R - Requirements
- **Goal**: Implement advanced filtering options on the Admin Schedule Grid to allow filtering by Department, Shift (Morning/Afternoon/Night/Hybrid), and Presence Status (Present/Absent).
- **Definition of Done**: 
  - UI includes 3 new dropdown selects next to the existing text search input.
  - The `filtered` list of employees respects all active filters concurrently.
  - The UI updates dynamically based on the selected filters.
- **Scope Out**: 
  - No changes to backend API. Filtering happens entirely on the client-side.
  - No new data fetching. Use existing `employees` state.

## E - Entities
- **ScheduleEmployee**: The existing interface representing an employee's schedule. Fields to filter on: `department`, `shift`, `isPresent`.
- **Filters State**: `departmentFilter` (string), `shiftFilter` (string), `statusFilter` (string).

## A - Approach
- Use React `useState` to store the active value of each filter.
- Update the `filtered` derivation logic to conditionally check `matchDept`, `matchShift`, and `matchStatus` against the employee's attributes.
- Use standard `<select>` tags styled consistently with the existing search input (glassmorphism/Tailwind) to minimize new dependencies.

## S - Structure
- Target file: `app/admin/schedule/page.tsx`
- The new `<select>` inputs will be placed in the header, inside the `<div className="flex items-center gap-3">` along with the text `<input>`.
- The filtering logic will be placed right after the text `search` filter logic.

## O - Operations
1. Add `useState` declarations for the 3 filters initialized to `'ALL'`.
2. Compute unique `departments` from the `employees` list to populate the department dropdown.
3. Update the `filtered` list calculation to include logic for department, shift, and status.
4. Add the 3 `<select>` elements to the JSX header, ensuring they match the styling of the search input (`bg-neutral-800/60 border border-neutral-700 rounded-xl px-3 py-1.5 text-sm text-white outline-none`).

## N - Norms
- Use Tailwind for all styling. No custom CSS.
- Maintain existing React functional component structure.

## S - Safeguards
- Fallback for `emp.department` when it is null (`'Sem Departamento'`).
- Ensure filters gracefully return to `'ALL'` if there are no matching results.
