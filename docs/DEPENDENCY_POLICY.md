# Dependency Update Policy

## Purpose
This document defines the policy for managing and updating project dependencies to maintain security, stability, and compatibility.

**Security:** OWASP A06:2021 (Vulnerable and Outdated Components)

---

## 1. Version Pinning Strategy

### Critical Dependencies (PINNED - No `^` or `~`)
The following dependencies are pinned to exact versions to prevent breaking changes:

- **Security-critical:** `dompurify`, `@supabase/supabase-js`
- **Core functionality:** `react`, `react-dom`, `@google/genai`
- **Runtime:** `express`, `dotenv`

### Development Dependencies (Allow Minor Updates with `^`)
DevDependencies can use `^` for minor version updates:

- Testing frameworks (Jest, Testing Library)
- Build tools (Vite, TypeScript)
- Type definitions

---

## 2. Update Frequency

| Type | Frequency | Process |
|------|-----------|---------|
| **Security patches** | Immediate | Apply within 24-48 hours |
| **Minor updates** | Monthly | First Monday of each month |
| **Major updates** | Quarterly | Q1, Q2, Q3, Q4 planning sprints |

---

## 3. Update Checklist

Before updating any dependency:

- [ ] Check `npm audit` for vulnerabilities
- [ ] Review CHANGELOG of the dependency
- [ ] Check GitHub Issues for known breaking changes
- [ ] Run full test suite (`npm run test:all`)
- [ ] Test in local development environment
- [ ] Update lockfile (`npm install`)
- [ ] Document changes in `CHANGELOG.md`
- [ ] Create ADR if major version bump

---

## 4. Security Monitoring

### Automated Tools
- **Dependabot:** GitHub Dependabot alerts enabled
- **npm audit:** Run before every release
- **Snyk/Socket:** Consider integration for production

### Manual Reviews
- Review security advisories weekly
- Check CVE databases for critical packages
- Monitor GitHub Security tab

---

## 5. Rollback Procedure

If an update causes issues:

1. **Immediate rollback:**
   ```bash
   git revert <commit-hash>
   npm install
   npm test
   ```

2. **Document the issue:**
   - Create GitHub Issue with error details
   - Add to `docs/audit/` with incident report
   - Update `CHANGELOG.md` with rollback note

3. **Investigate root cause:**
   - Check dependency's GitHub Issues
   - Test in isolated environment
   - Consider alternative packages

---

## 6. Dependency Exceptions

Some dependencies may require specific versions due to compatibility:

| Package | Pinned Version | Reason |
|---------|----------------|--------|
| `typescript` | `~5.8.2` | Vite compatibility |
| `dompurify` | `3.3.1` | XSS prevention (tested) |

---

## 7. New Dependency Approval

Before adding a new dependency:

- [ ] Check npm weekly downloads (min: 10k)
- [ ] Review GitHub stars/activity (min: 100 stars)
- [ ] Check last publish date (max: 6 months ago)
- [ ] Verify license compatibility (MIT, Apache, BSD)
- [ ] Check for known vulnerabilities
- [ ] Evaluate bundle size impact
- [ ] Consider maintenance status
- [ ] Document in ADR if critical

---

## 8. Commands Reference

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Update all dependencies (respecting pinned versions)
npm update

# Check outdated packages
npm outdated

# Reinstall from lockfile
npm ci

# Update specific package
npm install <package>@<version>
```

---

**Status:** 🟢 ACTIVE  
**Owner:** DevOps Team + Security Lead  
**Last Review:** 2026-01-28  
**Next Review:** 2026-04-28 (Quarterly)
