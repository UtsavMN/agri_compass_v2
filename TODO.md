# Task: Remove Expert Help AI Agent and Rename AirAgent to AI Agent

## Steps to Complete:
- [ ] Remove ExpertHelp component and references
  - [ ] Delete src/pages/ExpertHelp.tsx
  - [ ] Remove import and route from src/App.tsx
  - [ ] Remove nav item from src/components/Layout.tsx
  - [ ] Remove quick action from src/pages/Dashboard.tsx
- [ ] Rename AirAgent to AI Agent
  - [ ] Update title in src/pages/AirAgent.tsx
  - [ ] Update nav label in src/components/Layout.tsx
  - [ ] Update quick action title in src/pages/Dashboard.tsx
  - [ ] Update button text in src/pages/Dashboard.tsx
- [ ] Test the project
  - [ ] Run npm run dev
  - [ ] Verify navigation works
  - [ ] Verify AI Agent page loads correctly
  - [ ] Confirm Expert Help is removed from all locations

## Files to Edit:
- src/pages/ExpertHelp.tsx (delete)
- src/App.tsx
- src/components/Layout.tsx
- src/pages/Dashboard.tsx
- src/pages/AirAgent.tsx

## Testing Checklist:
- [ ] Project builds without errors
- [ ] Navigation menu shows "AI Agent" instead of "AirAgent"
- [ ] Expert Help is completely removed from navigation and dashboard
- [ ] AI Agent page loads and functions correctly
- [ ] No broken links or missing components
