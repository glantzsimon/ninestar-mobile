# Windows verifier primitive validation

Executed 23 October 2026 against backend commit
`9225273f0e7d7b6c3ebde949d9b8ffaa8c6373f0` on `feature/mobile-json-api`.

Read before execution:
- `ninestar/docs/apple-verifier-compatibility.md`
- `ninestar/tools/AppleVerifierCompatibility/README.md`
- The standalone csproj and Program.cs (synthetic in-memory keys/certificates,
  no network/database/website dependency).

## Exact outcome

**Windows VS2017 build passed: 0 warnings, 0 errors, exit code 0.**
**Direct Windows .NET Framework execution passed all 15 primitive checks,
exit code 0.** This is new Windows evidence, separate from the earlier Linux
.NET 8 execution described in the backend assessment.

| Item | Observed value |
| --- | --- |
| MSBuild | VS2017 Community `15.9.30.58560` |
| MSBuild path | `C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\MSBuild\15.0\Bin\MSBuild.exe` |
| C# compiler | Roslyn `2.10.0.0 (4293e20e)` from the same installation |
| Target | `.NET Framework v4.7.2`, C# `7.3`, Debug, default AnyCPU / prefer-32-bit |
| Reference assemblies | `C:\Program Files (x86)\Reference Assemblies\Microsoft\Framework\.NETFramework\v4.7.2\` |
| Installed Framework runtime | `4.8.03752`, registry Release `528040` |
| Dependency | Existing `webapp\packages\BouncyCastle.Cryptography.2.6.2\lib\net461\BouncyCastle.Cryptography.dll` |
| Additional build validation | `/p:TreatWarningsAsErrors=true` |
| Build elapsed time | `00:00:02.56` as reported by MSBuild |

.NET Framework 4.8 is the installed in-place Framework runtime. The executable
targets 4.7.2 and was run directly as a Windows exe, **not** with `dotnet` or a
Linux runtime. This does not claim a separate machine running exactly 4.7.2 was tested.

## Reproduce without writing build outputs into the website checkout

From PowerShell:

```powershell
$probeArtifacts = 'D:\Workspace\ninestar-mobile\.expo\apple-verifier-compatibility'
New-Item -ItemType Directory -Path $probeArtifacts -Force | Out-Null

& 'C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\MSBuild\15.0\Bin\MSBuild.exe' `
  'D:\Workspace\ninestar\tools\AppleVerifierCompatibility\AppleVerifierCompatibility.csproj' `
  /t:Build /p:Configuration=Debug /p:TreatWarningsAsErrors=true `
  /p:OutputPath=D:\Workspace\ninestar-mobile\.expo\apple-verifier-compatibility\bin\Debug\ `
  /p:BaseIntermediateOutputPath=D:\Workspace\ninestar-mobile\.expo\apple-verifier-compatibility\obj\ `
  /p:IntermediateOutputPath=D:\Workspace\ninestar-mobile\.expo\apple-verifier-compatibility\obj\Debug\ `
  /nologo /verbosity:normal
$LASTEXITCODE

& "$probeArtifacts\bin\Debug\AppleVerifierCompatibility.exe"
$LASTEXITCODE
```

The executed commands also captured stdout/stderr with Tee-Object into
`.expo/apple-verifier-compatibility/build.log` and `run.log`. Generated binaries,
dependency copies and logs remain local ignored build artifacts. No package
restore, download or website dependency adjustment was needed.

## Exact run output

```text
PASS X.509 DER certificate parsing
PASS PKCS#8 EC private-key import (Apple .p8 building block)
PASS ES256-compatible P-256 signature is 64-byte r||s
PASS ECDSA signature acceptance
PASS Changed payload rejected
PASS Changed signature rejected
PASS Unrelated signing key rejected
PASS Root/intermediate/leaf certificate signatures validate
PASS Unrelated trust-root key rejected
PASS Certificate purpose OIDs and CA constraint are readable
PASS Missing leaf purpose can be distinguished
PASS Expired certificate rejected
PASS OCSP request generation and parsing
PASS Signed OCSP response generation and signature verification
PASS OCSP response with unrelated key rejected
PASS: 15 primitive compatibility checks.
Not tested: Apple trust policy, live OCSP/network, Windows/IIS, real Apple transactions, membership integration.
```

The final `Not tested` line is hard-coded in Program.cs. Its Windows/IIS wording
was not changed: **Windows console execution is now tested; IIS remains untested**.
Other listed exclusions remain valid. This probe does not implement Apple's
complete certificate/path/revocation policy, JWS parsing or account/entitlement checks.

Artifact SHA-256 values for this build (not reproducible-build guarantees):

- Exe: `4884160F557FE973FDB949B82CD5C121FAC7F4E7C5BE30CF6EE5A5CF268D8636`
- Existing Bouncy Castle DLL: `D9A58C84BAA55A12684CD2381BCA03C8F2A9CBAE21A6BF1E9EBD65F495629721`

## Meaning and remaining gates

The Windows compiler/reference-assembly/runtime primitive check is passed. No
fundamental Framework cryptographic API blocker appeared in these tests. The
full Apple verifier gate is still open: reviewed Apple trust/purpose/chain and
revocation policy, signed-data fixtures, fixed-host API calls and request budgets,
real Sandbox transactions/notifications, website package loading/binding redirects
under IIS, concurrency and membership integration are not validated by this console
probe. The .NET-targeted IdentityModel packages were not exercised here.

The website git working tree remained clean after the build/run. No backend source,
csproj, dependency version, account, purchase, migration or deployment was changed.
Keep the app's 15-second HTTP timeout. Shared entitlements for existing website
memberships remain the first implementation slice; Apple billing follows later.
