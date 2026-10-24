# Windows backend validation: fe6c781e

Validated on 23 October 2026 against the clean checkout at
`D:\Workspace\ninestar`, commit `fe6c781e42e9d11b7768fed786cdadfbce9644d1`.

## Build

Used the installed Visual Studio 2017 Community MSBuild:
`C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\MSBuild\15.0\Bin\MSBuild.exe`.

```powershell
& $msbuild 'D:\Workspace\ninestar\webapp\NineStar.sln' /t:Rebuild /p:Configuration=Debug '/p:Platform=Any CPU' /p:LangVersion=7.3 /p:DeployOnBuild=false /nologo /verbosity:minimal /fileLogger '/fileLoggerParameters:LogFile=D:\Workspace\ninestar-mobile\.expo\backend-validation-fe6c781e\build.log;Verbosity=normal'
```

Result: exit code 0, **0 errors, 361 warnings**, elapsed 40.65 seconds.
This was a rebuild of the solution using its existing installed dependencies;
no package restore or dependency changes were needed.

Warnings included access-denied cleanup of existing build outputs (MSB3061),
an assembly-reference cache write warning (MSB3101), dependency-version conflicts
(MSB3277), a System.Net.Http binding-redirect conflict (MSB3836), compiler warnings,
and xUnit analyser warnings. The successful rebuild is not warning-free.

## Tests

Ran the existing xUnit 2.3.1 `tools\net452\xunit.console.exe` against both test
assemblies in the solution, using `-noshadow` and XML reporting. The runner
identified itself as **64-bit Desktop .NET 4.0.30319.42000**; this was a Windows
.NET Framework run, not Linux or .NET 8.

| Assembly | Passed | Failed | Skipped | Errors |
| --- | ---: | ---: | ---: | ---: |
| K9.WebApplication.Tests | 569 | 0 | 0 | 0 |
| K9.DataAccessLayer.Tests | 3 | 0 | 0 | 0 |
| Total | 572 | 0 | 0 | 0 |

Runner exit code: **0**. Total reported test time: 42.123 seconds
(43.831 seconds including runner overhead).

Requested classes, confirmed from the result XML:

| Class | Passed | Failed |
| --- | ---: | ---: |
| MobileEntitlementsControllerTests | 5 | 0 |
| MobileEntitlementsMapperTests | 13 | 0 |
| MembershipModelserviceTests | 12 | 0 |

No test failures or runner errors occurred. These results validate the build
and automated tests; they do not establish deployed HTTP behaviour or live
account/database integration.

## Scope and artifacts

No backend source changes, migrations, deployment, website startup, or Apple
purchasing implementation were performed. Backend Git status remained clean.
The mobile client's 15-second timeout remains unchanged.

Local ignored artifacts: `.expo/backend-validation-fe6c781e/build.log`,
`tests.log`, and `tests.xml` in the mobile workspace.

Mobile workspace checks also passed: `expo lint` and `tsc --noEmit`.
