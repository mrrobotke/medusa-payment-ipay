# Package Updater Script

This script automatically updates all packages in your `package.json` to their latest versions available on npm.

## 🚀 Quick Start

Run the script using one of these methods:

```bash
# Using npm script (recommended)
yarn update-packages
# or
npm run update-packages

# Or run directly
node update-packages.js
```

## 📋 What It Does

1. **Creates a backup** of your current `package.json` (timestamped)
2. **Checks all dependencies** (dependencies, devDependencies, peerDependencies)
3. **Fetches latest versions** from npm registry using `npm view {package} version`
4. **Updates package.json** with latest versions while preserving version prefixes (`^`, `~`, etc.)
5. **Shows a detailed report** of what was updated

## 🔧 Features

- ✅ **Safe**: Creates automatic backups before making changes
- ✅ **Smart**: Preserves version prefixes (`^1.0.0` becomes `^2.0.0`, not `2.0.0`)
- ✅ **Selective**: Skips local dependencies (relative paths, git URLs)
- ✅ **Informative**: Colorful output with detailed progress and summary
- ✅ **Error handling**: Gracefully handles packages that can't be found

## 📊 Example Output

```
📦 Package Updater Script

💾 Backup created: package.json.backup.1672531200000

🔍 Checking dependencies...
  📋 Checking crypto-js (current: ^4.2.0)
    ✅ Updated: 4.2.0 → 4.3.1

🔍 Checking devDependencies...
  📋 Checking @types/node (current: ^20.0.0)
    ✓ Already latest: 20.11.5
  📋 Checking typescript (current: ^5.6.2)
    ✅ Updated: 5.6.2 → 5.7.2

✅ package.json updated successfully!

📊 Summary:
  📦 Total packages checked: 25
  ✅ Packages updated: 3
  ⚠️  Packages with errors: 0
  💾 Backup file: package.json.backup.1672531200000

⚠️  Don't forget to run:
   yarn install or npm install
   yarn build to test the build with updated packages

🎉 Package update complete!
```

## 🔄 After Running the Script

1. **Install updated packages**:
   ```bash
   yarn install
   # or
   npm install
   ```

2. **Test your build**:
   ```bash
   yarn build
   ```

3. **Run tests** (if you have them):
   ```bash
   yarn test
   ```

## ⚡ Advanced Usage

### Version Prefix Behavior

The script preserves your version prefixes:
- `^1.0.0` → `^2.0.0` (caret range)
- `~1.0.0` → `~2.0.0` (tilde range)  
- `>=1.0.0` → `>=2.0.0` (greater than or equal)
- `1.0.0` → `^2.0.0` (exact becomes caret - safer default)

### Skipped Packages

The script automatically skips:
- Local dependencies: `./local-package`, `file:../sibling-package`
- Git dependencies: `git+https://github.com/user/repo.git`
- Any dependency that starts with `.`, `git`, or `file:`

### Backup Files

Backup files are named with timestamps:
- `package.json.backup.1672531200000`
- You can restore by simply copying back: `cp package.json.backup.1672531200000 package.json`

## 🛠️ Troubleshooting

### "Could not fetch version" Warnings

Some packages might show warnings like:
```
⚠️  Could not fetch version for some-package: Error message
```

This can happen when:
- Package doesn't exist on npm registry
- Network connectivity issues
- Package name is misspelled in package.json
- Private registry packages (requires authentication)

The script will continue with other packages and report errors in the summary.

### Package Not Found

If a package genuinely doesn't exist:
1. Check if the package name is correct
2. Verify it exists on [npmjs.com](https://npmjs.com)
3. Consider removing deprecated packages manually

### Build Failures After Update

If your build fails after updating:
1. Check the backup file timestamp shown in output
2. Restore the backup: `cp package.json.backup.{timestamp} package.json`
3. Run `yarn install` to restore old versions
4. Investigate breaking changes in the updated packages
5. Update your code to handle breaking changes, or pin problematic packages to older versions

## 🔒 Safety Tips

- Always **test your build** after running the update
- **Review the changes** before committing
- **Read release notes** for major version updates
- Consider **running updates on a branch** first
- Keep the **backup files** until you're confident everything works

## 📝 Customization

You can modify the script to:
- Skip certain packages by adding conditions in `updatePackageSection()`
- Change version prefix behavior in the update logic
- Add custom npm registry support
- Filter updates by version type (major, minor, patch)

The script is designed to be readable and easily customizable for your needs! 