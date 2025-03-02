===
# Vibe Coding Simulator – Detailed ProjectPlan

## 1. Overview & Vision
Vibe Coding Simulator is an incremental, AI-focused resource-management game where players start as solo developers and expand into a mini “vibe coding” empire. The core pillars include:
- **Collectible Prompt Library** (inspired by TCG).
- **Random Drops** from project completions for added excitement.
- **Dynamic Market/Trends** to introduce strategic depth.
- **Customization & NPC Relations** for emotional investment and replayability.

## 2. Phased Roadmap (Summary)
Though the plan envisions seven total phases, our **MVP** will focus on:
1. **Phase 1**: Core Loop (solo entrepreneur, time-block management, Tier 1 hardware/models, basic prompt usage).  
2. **Phase 2**: AI Model Integration & Prompt Collection (introduce Tier 2 models, random prompt drops, more sophisticated tasks).

Subsequent phases (3–7) add market systems, advanced AI tiers, hardware expansions, NPCs, customization, and polish. This ensures a controlled, incremental release of features.

---

## 3. Prompting Techniques (Expanded)
Prompts are “cards” the player collects/unlocks and can equip for each coding sprint. Each technique can synergize with certain AI models or certain project challenges.

1. **Basic Instruction**  
   - **Usage**: Single-step directives (e.g., "Generate a login screen").  
   - **Effect**: +5% success rate for straightforward tasks.  
   - **Tier**: Always available from the start.

2. **Step-by-Step Reasoning**  
   - **Usage**: Breaks down complex logic into smaller steps.  
   - **Effect**: +10% success rate on higher-complexity logic tasks; typically beneficial for Tier 2 or above.  
   - **Unlock**: Found rarely in early loot drops; guaranteed by Phase 2 research.

3. **Few-Shot Examples**  
   - **Usage**: Provide input-output examples to guide AI.  
   - **Effect**: +10% success rate if the project is tutorial-like (documentation, quiz, or structured tasks).  
   - **Unlock**: Researched or discovered in Phase 2.

4. **Persona/System Context**  
   - **Usage**: Set a persona or system style for domain-specific tasks.  
   - **Effect**: +15% success rate when the project has brand or tone requirements (e.g., marketing copy, influencer content).  
   - **Unlock**: Unlocked or discovered by mid-Phase 2.

5. **Iterative Refinement**  
   - **Usage**: Iterative improvement cycle on partially generated code.  
   - **Effect**: +10% success rate on Tier 2+ projects requiring multiple iterations.  
   - **Unlock**: Found in random loot or special research events after completing multiple projects.

6. **Creative Temperature**  
   - **Usage**: Encourages AI to produce more novel/creative outputs.  
   - **Effect**: +15% success rate for creative tasks (games, marketing visuals, concept prototypes) but can reduce reliability on purely technical tasks.  
   - **Unlock**: Discovered in Tier 2+ or special events.

7. **Debugging & Error Correction**  
   - **Usage**: Specifically prompts the AI to find and fix errors in code.  
   - **Effect**: +20% success rate if the project is failing due to repeated code errors or bugs.  
   - **Unlock**: Learned from “Study Documentation” or specific research dialogues.

---

## 4. AI Models & Tiers (Attributes Defined)
Below are example models for Tiers 1–3, each with enumerated attributes.

### Attributes Key
- **Knowledge Cutoff**: The approximate year/date up to which the model “knows” information.  
- **Web Search**: Whether it can dynamically search the web.  
- **Image Generation**: Ability to generate or interpret images.  
- **Multimodal**: Handles text + other media (images, audio) in a unified approach.  
- **Creativity** (1–10): Tendency to produce imaginative, less predictable output.  
- **Direction-Following** (1–10): Reliability in adhering to instructions.  
- **Reasoning** (1–10): Logical problem-solving capacity.

#### Tier 1 Models (Available Phase 1)
1. **GPT-3**  
   - Knowledge Cutoff: 2021  
   - Web Search: No  
   - Image Generation: No  
   - Multimodal: No  
   - Creativity: 6  
   - Direction-Following: 7  
   - Reasoning: 6  

2. **GPT-3.5 Turbo**  
   - Knowledge Cutoff: 2021  
   - Web Search: No  
   - Image Generation: No  
   - Multimodal: No  
   - Creativity: 7  
   - Direction-Following: 8  
   - Reasoning: 7  

3. **Bloom**  
   - Knowledge Cutoff: 2021  
   - Web Search: No  
   - Image Generation: No  
   - Multimodal: No  
   - Creativity: 6  
   - Direction-Following: 6  
   - Reasoning: 6  

#### Tier 2 Models (Introduced Phase 2)
1. **GPT-4**  
   - Knowledge Cutoff: 2022  
   - Web Search: No (base version)  
   - Image Generation: No  
   - Multimodal: No (base version)  
   - Creativity: 8  
   - Direction-Following: 9  
   - Reasoning: 9  

2. **Claude 2**  
   - Knowledge Cutoff: 2022  
   - Web Search: No  
   - Image Generation: No  
   - Multimodal: No  
   - Creativity: 7  
   - Direction-Following: 8  
   - Reasoning: 8  

3. **Falcon-40B**  
   - Knowledge Cutoff: 2022  
   - Web Search: No  
   - Image Generation: No  
   - Multimodal: No  
   - Creativity: 7  
   - Direction-Following: 7  
   - Reasoning: 8  

#### Tier 3 Models (Phase 4+)
1. **GPT-4 Turbo**  
   - Knowledge Cutoff: 2023  
   - Web Search: Optional (depending on expansions)  
   - Image Generation: No  
   - Multimodal: Partial (some limited advanced modules)  
   - Creativity: 9  
   - Direction-Following: 9  
   - Reasoning: 9  

2. **GPT-4 Vision**  
   - Knowledge Cutoff: 2023  
   - Web Search: No  
   - Image Generation: No (but can interpret images)  
   - Multimodal: Yes  
   - Creativity: 8  
   - Direction-Following: 9  
   - Reasoning: 9  

3. **Claude 2.1**  
   - Knowledge Cutoff: 2023  
   - Web Search: Possibly partial  
   - Image Generation: No  
   - Multimodal: Potential text + structured data  
   - Creativity: 8  
   - Direction-Following: 9  
   - Reasoning: 9  

---

## 5. Hardware Tiers (Expanded)
Hardware gates which models and advanced integrations can be run:

1. **Tier 1 Hardware**  
   - Typical Setup: Consumer CPU, GPU ~ RTX 3060, Basic Cloud Credits.  
   - Suitable Models: GPT-3, GPT-3.5 Turbo, Bloom.  
   - Limitations: Struggles with Tier 2+ models (reduced success rates or longer ‘coding sprints’).

2. **Tier 2 Hardware**  
   - Setup: High-End CPU, GPU ~ RTX 4070, Expanded Cloud Credits.  
   - Suitable Models: GPT-4, Claude 2, Falcon-40B.  
   - Access: Allows partial concurrency, stable operation of Tier 2 AI, advanced prompts.  
   - Unlocked: After consistent success in Phase 1/2 projects.

3. **Tier 3 Hardware** (Future Phases)  
   - Setup: Workstation CPU, GPU ~ RTX 4090, Dedicated Cloud Server.  
   - Suitable Models: GPT-4 Turbo, GPT-4 Vision, Claude 2.1.  
   - Access: Freed up in Phase 4 expansions or after major capital investment.

---

## 6. Challenge Examples & Requirements
Below are representative projects that appear in the “job board.” Each requires specific hardware tiers, minimum AI model tiers, and often certain prompt techniques for optimal success.

### Tier 1 Challenges
1. **Simple To-Do App**  
   - **Hardware**: Tier 1 minimum.  
   - **AI Model**: Tier 1 minimum (GPT-3.5 Turbo recommended).  
   - **Prompt Techniques**: Basic Instruction is enough.  
   - **Pass Condition**: 2–3 successful coding sprints (70%+ overall success).  
   - **Reward**: \$500–\$800, small chance to drop Basic or Step-by-Step Reasoning prompt if not owned.

2. **Static Personal Website**  
   - **Hardware**: Tier 1 minimum.  
   - **AI Model**: GPT-3 or better.  
   - **Prompt Techniques**: Basic Instruction.  
   - **Pass Condition**: 2 successful sprints.  
   - **Reward**: \$300–\$600, chance to drop persona-based templates.

### Tier 2 Challenges
1. **Interactive Quiz Platform**  
   - **Hardware**: Tier 2 recommended (Tier 1 possible but with lower success rates).  
   - **AI Model**: GPT-4 or Claude 2 recommended.  
   - **Required Prompt**: Step-by-Step Reasoning, Few-Shot Examples for best results.  
   - **Pass Condition**: 4 successful sprints, including quiz logic verification.  
   - **Reward**: \$1,500–\$2,000, moderate chance to drop Iterative Refinement or Creative Temperature prompts.

2. **API Reference Documentation**  
   - **Hardware**: Tier 2 recommended.  
   - **AI Model**: GPT-4 Turbo or Claude 2.1 yields best success.  
   - **Required Prompt**: Persona Context + Iterative Refinement recommended (makes docs thorough).  
   - **Pass Condition**: 3–4 successful sprints (90% doc coverage).  
   - **Reward**: \$1,200–\$2,500, higher chance to drop advanced debugging prompt.

### Tier 3 Challenges (Phase 4+)
1. **Comprehensive SaaS MVP**  
   - **Hardware**: Tier 3 strongly recommended (bottlenecks otherwise).  
   - **AI Model**: GPT-4 Vision, Claude 2.1, or GPT-4 Turbo for top performance.  
   - **Prompt Techniques**: Iterative Refinement, Persona Context for brand identity, possibly Step-by-Step for complex logic.  
   - **Pass Condition**: 5+ successful sprints, multi-feature integration.  
   - **Reward**: \$5,000–\$10,000, potential big loot (rare prompts, large skill boosts).

2. **Mobile App Prototype**  
   - **Hardware**: Tier 2 minimum but Tier 3 is ideal.  
   - **AI Model**: GPT-4 Turbo or better if advanced features needed.  
   - **Prompt Techniques**: Creative Temperature + Step-by-Step Reasoning, plus Web Search integration.  
   - **Pass Condition**: 4–5 successful sprints, stable build with creative UI.  
   - **Reward**: \$4,000–\$8,000, chance of rare advanced prompts or specialized hardware upgrade vouchers.

---

## 7. Core MVP Gameplay Loop (Refined)
1. **Daily Actions**  
   - Use 8 daily time blocks for activities: check job postings, research new prompts, or code existing projects.  
   - Possibly discover new prompt loot if you engage with random events.

2. **Project Acceptance**  
   - Choose from Tier 1 or Tier 2 challenges (based on hardware).  
   - Evaluate recommended AI model, hardware load, and required prompts.

3. **Coding Sprints**  
   - Each sprint: choose a prompt technique + AI model.  
   - A success/fail roll occurs, influenced by synergy between model/hardware/prompt.  
   - Partial success accumulates progress; repeated failures can force restarts or time out.

4. **Earnings & Upgrades**  
   - Completing challenges grants money, skill XP, and random prompt drops (especially if synergy was high).  
   - Invest money to buy or lease better hardware for Tier 2 usage.  
   - Expand Prompt Library for improved synergy on future tasks.

5. **Repeat Cycle**  
   - End day → lose leftover time blocks.  
   - Next day, new project offers, shifting partial market or mini trends.

---

## 8. Next Steps for Implementation
1. **Database of Prompts & Models**  
   - Hard-code or data-drive the specifics: attributes, synergy rules, etc.

2. **UI for Project Selection**  
   - Show challenge requirements & recommended synergy.  
   - Provide feedback on success likelihood.

3. **Sprint Resolution System**  
   - Implement pass/fail calculations factoring in model stats, synergy with prompt technique, hardware tier, and skill levels.

4. **Reward & Drop Tables**  
   - Configure random drops to ensure a feasible path to unlock advanced techniques (e.g., Step-by-Step, Persona, Debugging).

5. **Initial Balancing**  
   - Tweak default success rates, project durations, and reward amounts to keep early gameplay engaging but not too punishing.

---

## 9. Risk Management (Recap)
1. **Scope Creep**  
   - Keep advanced Tier 3 content (GPT-4 Vision, etc.) outside MVP if needed.
2. **Balancing Complexity**  
   - Gradually unlock new prompt techniques; avoid overwhelming players on Day 1.
3. **Performance Constraints**  
   - Keep advanced AI “simulation” abstract; do not attempt real-time heavy computations.
4. **Market & Randomness**  
   - Introduce partial forecasting or stable cycles to avoid player frustration.
5. **Underestimating 3D & AI Integration**  
   - Use placeholders for elaborate 3D environment; focus on robust coding sprint logic.

---

## 10. Conclusion
This updated ProjectPlan details each prompt technique, enumerates available AI models (with attributes), and outlines specific challenge requirements. By structuring Tier 1–3 hardware and model usage, players progressively access more advanced tasks and specialized prompts. The synergy-based sprint system, random prompt drops, and incremental expansions ensure a gameplay loop that is both engaging and rewarding.

With a careful approach to risk management and phased development, Vibe Coding Simulator can steadily evolve from a focused MVP into a rich, AI-driven simulation experience.

===
