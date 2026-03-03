# Agent Instructions

These instructions apply to all coding agents working in this repository.

1. Use TypeScript for all application code.
2. Use `.tsx` for React components and `.ts` for non-React modules.
3. Do not add new `.js` or `.jsx` files in app source code.
4. Treat lint as a completion gate:
   - Run `npm run lint` in `code/ui/my-react-app`
   - Fix all lint errors before considering work complete.
5. Treat type safety as required:
   - Keep TypeScript enabled.
   - Prefer explicit types for props, refs, state, and function boundaries.
