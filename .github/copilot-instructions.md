# GitHub Copilot Instructions

When generating or modifying code in this repository:

1. Use TypeScript everywhere in app source code.
2. Use `.tsx` for React components and `.ts` for other modules.
3. Do not generate `.jsx` or `.js` app files.
4. Ensure lint is clean before a task is considered complete:
   - Run `npm run lint` in `code/ui/my-react-app`
   - Resolve all lint errors.
5. Prefer strongly typed code:
   - Add explicit interfaces/types for props and shared data models.
   - Avoid implicit `any` at function/component boundaries.
