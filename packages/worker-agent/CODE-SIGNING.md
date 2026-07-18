# Code Signing — NexusShift Agent

The Windows installer is unsigned by default, which makes Windows SmartScreen
show an **"unknown publisher"** warning on other people's machines. Signing the
installer with a certificate from a trusted Certificate Authority (CA) removes
that warning.

The signing pipeline is **already wired up** (electron-builder). You only need to
supply a certificate — no code changes required.

---

## Status

- ✅ Signing pipeline configured and tested end-to-end.
- ✅ Verified with a self-signed test certificate (signature embeds correctly:
  Authenticode / SHA256).
- ⚠️ The current `release/*.exe` is signed with a **self-signed TEST cert** — it
  is **not trusted** and must be re-signed with a real CA certificate before you
  distribute it to other machines.

---

## How to sign with a real certificate

electron-builder reads two environment variables. Once you have your certificate
as a `.pfx` / `.p12` file, sign by running the normal build with them set:

```bash
# from packages/worker-agent
export CSC_LINK="C:/path/to/your-certificate.pfx"   # path to the cert file
export CSC_KEY_PASSWORD="your-cert-password"         # the cert's password
npm run dist:win                                     # builds + signs
```

(PowerShell: `$env:CSC_LINK="..."; $env:CSC_KEY_PASSWORD="..."` then the build.)

That's the entire change. The output installer in `release/` will carry a trusted
signature. Verify it with:

```powershell
Get-AuthenticodeSignature "release\NexusShift Agent Setup 1.0.0.exe"
# Status should be "Valid" with a real cert.
```

---

## Getting a certificate — options

Under current CA/Browser Forum rules, standard (OV) and EV code-signing certs must
be stored on a hardware token or cloud HSM. Options, roughly:

| Option | Cost (approx) | SmartScreen | Notes |
|---|---|---|---|
| **Azure Trusted Signing** | ~$10/month | Trusted (builds fast) | Cloud-based, **no hardware token**. Modern, cheapest. Needs an Azure account + identity validation. electron-builder supports it. **Recommended for small orgs.** |
| **EV code-signing cert** | ~$300–700/yr | **Instant** trust, no warning | Ships on a USB hardware token. Best if you want zero warnings immediately. |
| **OV code-signing cert** | ~$200–400/yr | Warning fades as install "reputation" builds | Cheaper than EV but warnings persist until enough users install. |

Providers: DigiCert, Sectigo, SSL.com, GlobalSign. For Azure Trusted Signing, see
Microsoft's "Trusted Signing" service.

All of these require verifying your business/individual identity — that step, and
the purchase, can only be done by you.

---

## Cleaning up the test certificate

A self-signed cert named `CN=NexusShift Test (DO NOT DISTRIBUTE)` was created in
your personal certificate store for pipeline testing. Remove it any time with:

```powershell
Get-ChildItem Cert:\CurrentUser\My | Where-Object { $_.Subject -like '*NexusShift Test*' } | Remove-Item
```
