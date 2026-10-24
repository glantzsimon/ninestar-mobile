# Welcome to your Expo app 👋

The app now uses a shared NineStar theme, local Candara fonts and the website's
original brand mark. Review the **Style Guide** tab on your device; see
[the design system](docs/design-system.md) for source colours, reusable components
and the template for new screens.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## NineStar API integration

The My Chart screen targets `https://int.9starkiastrology.com/api/mobile/v1`.
The owner verified metadata HTTP 200, signed-out account HTTP 401 and successful login
on iPhone through Expo Go. Login fetches CSRF, retains native cookies, posts once,
refreshes CSRF and checks account/me. It then opens the protected own chart, using
the free response only after an explicit membership denial. Readings are grouped
and expandable; see [the chart slice](docs/mobile-chart.md) for contracts and limits.
Passwords remain in memory and the form clears them after each attempt.
Remember-me is disabled. Cookie persistence after app restart, logout/session expiry,
chart parity with the website and Android still need device validation.
No credentials belong in source or logs.

**My Account** loads existing personal/birth details and calculation preferences,
and saves through the existing CSRF-protected API. Review prefilled values before
changing them. Date/time validation preserves date-only birth dates and separate
timezones. See [My Account](docs/mobile-account.md) for contracts and validation limits.

Browser API calls currently fail CORS; the login form is offered on native platforms only.
The existing MVC website and backend are unchanged by this app.

Shared website/App Store subscription work follows the backend contract in
`ninestar/docs/mobile-api.md`; see [integration notes](docs/app-subscriptions.md).
One account serves both platforms. Apple purchasing endpoints remain proposed,
and no Apple billing integration is implemented in this app yet.

Checks: `npx tsc --noEmit`, `npx expo lint`, and `node --test tests/*.test.cjs`.
The request tests use mocked responses and do not establish device cookie handling.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
