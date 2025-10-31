# Agri
 Compass Fixes and Enhancements TODO

## 1. Community Page Error Fix
- [ ] Investigate and fix "Could not find the table 'public.posts'" error
- [ ] Ensure backend uses correct table (community_posts vs posts)
- [ ] Update Community.tsx to use proper table and queries
- [ ] Add search functionality for posts (crop, keywords, tags, locations, users)

## 2. Rename Community to Home Page
- [ ] Update navigation in Layout.tsx to show "Home" instead of "Community"
- [ ] Change route in App.tsx: /community to /home, redirect / to /home after login
- [ ] Update Home.tsx to be the social feed page
- [ ] Remove/disable current /home route (404)

## 3. My Farm Enhancements
- [ ] Add duration, weather notes, next steps fields to farms table in migrations
- [ ] Update MyFarm.tsx UI to display and edit these fields
- [ ] Add image upload functionality for farms
- [ ] Implement "Share farm status as post" feature to Community/Home
- [ ] Add monthly task suggestions based on crop and region

## 4. AI Agent Fixes
- [ ] Fix conversation interruptions and missing responses in airAgent.ts
- [ ] Add fallback error handling and timeout messaging
- [ ] Improve reliability for crop advice, weather reports, platform support
- [ ] Allow questions on crop, platform usage, farm-specific suggestions

## 5. General UI/UX Improvements
- [ ] Ensure all features are mobile responsive
- [ ] Add notifications for new comments, likes, farm activity reminders
- [ ] Enable multi-language support for posts, AI Agent, UI elements

## 6. Testing and Verification
- [ ] Test all database queries and integrations
- [ ] Verify search and filter functionality
- [ ] Test AI Agent conversations
- [ ] Check mobile responsiveness
- [ ] Validate multi-language features
