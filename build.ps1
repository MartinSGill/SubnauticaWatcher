

$msbuildExe = "msbuild"
try { 
    Get-Command msbuild -ErrorAction Stop  
} catch { 
    Write-Warning "MSBuild not in path, trying default install location"
    $vs2017MsBuild = "C:\Program Files (x86)\Microsoft Visual Studio\2017\Enterprise\MSBuild\15.0\Bin\amd64\MSBuild.exe"
    if (Test-Path $vs2017MsBuild)
    {
        $msbuildExe = $vs2017MsBuild
    } else {
        throw "Msbuild not found."
    } 
 }

if ($args.Count -gt 0) {
	$cmdline =  @($args) + @("/bl", "subnautica-watcher.proj")
} else {
    $cmdline = @("/t:package", "/v:m", "/bl", "subnautica-watcher.proj")
}

& $msbuildExe $cmdline
