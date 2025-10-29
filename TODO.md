# Agri Compass Enhancement TODO

## Phase 1: Setup & Dependencies
- [x] Install required libraries (recharts, framer-motion, lucide-react, @types/uuid, openai)
- [ ] Update package.json with new dependencies
- [ ] Create .env.local with API keys (OpenAI, OpenWeather, etc.)
- [ ] Update tailwind.config.js for theme and fonts

## Phase 2: AI Modules (src/lib/ai/)
- [x] Create src/lib/ai/ folder
- [x] airAgent.ts - OpenAI/GPT-4 integration for agricultural advice
- [x] cropRecommender.ts - District-based crop suggestions
- [x] diseaseDetector.ts - Hugging Face plant disease detection
- [x] weatherAdvisor.ts - OpenWeather API + AI summarization
- [x] translator.ts - Enhanced Google Translate for English ↔ Kannada

## Phase 3: Data Integration
- [x] Create districts.csv with Karnataka districts data
- [ ] Upload districts.csv to Supabase storage/table
- [ ] Add districts table to Supabase migration if needed

## Phase 4: Route & Page Updates
- [x] Update src/App.tsx routes
- [x] Rename src/pages/Index.tsx to src/pages/Home.tsx (Instagram-style feed)
- [ ] Update src/pages/Dashboard.tsx with district filtering and AI insights
- [ ] Update src/pages/MarketPrices.tsx with district/crop filters and charts
- [ ] Merge src/pages/MyFarms.tsx with Weather.tsx into MyFarm.tsx
- [ ] Rename src/pages/Chat.tsx to src/pages/AirAgent.tsx with AI upgrades
- [ ] Update src/pages/Profile.tsx with image upload and language toggle

## Phase 5: UI/UX Enhancements
- [ ] Apply green & white theme with larger fonts
- [ ] Add Noto Sans Kannada font support
- [ ] Implement Framer Motion transitions
- [ ] Update icons to be more farmer-friendly
- [ ] Ensure responsive design for all devices

## Phase 6: Feature Integration
- [ ] Implement bilingual posts (English + Kannada)
- [ ] Add auto-translation for new posts
- [ ] Integrate district-based filtering
- [ ] Add AI crop recommendations
- [ ] Implement disease detection upload
- [ ] Add weather AI summaries
- [ ] Upgrade chatbot with agricultural context

## Phase 7: Testing & Validation
- [ ] Test all AI API integrations
- [ ] Verify Supabase data integrity
- [ ] Test responsive design
- [ ] Run npm run dev and verify features
- [ ] Check bilingual functionality
- [ ] Validate district filtering

## Phase 8: Final Polish
- [ ] Code cleanup and optimization
- [ ] Add loading states and error handling
- [ ] Performance optimizations
- [ ] Documentation updates
