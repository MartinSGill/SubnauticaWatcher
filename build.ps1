
try {
    Import-Module VSSetup
} catch {
    try {
        Install-Module VSSetup
        Import-Module VSSetup            
    }
    catch {
        Write-Error "Unable to import VSSetup module."
        throw
    }
}

$msbuildExe = @(Get-ChildItem -Recurse -Path ((Get-VSSetupInstance).InstallationPath) -Filter "msbuild.exe" -ErrorAction Stop)[0].Fullname

if ($args.Count -gt 0) {
	$cmdline = @($args)
} else {
	$cmdline = @("subnautica-watcher.proj")
}

& $msbuildExe $cmdline
