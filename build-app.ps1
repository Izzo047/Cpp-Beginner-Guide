$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$source = Join-Path $root 'desktop-app\FieldnotesLauncher.cs'
$executable = Join-Path $root 'Fieldnotes.exe'
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path $compiler)) {
    $compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe'
}

if (-not (Test-Path $compiler)) {
    throw 'The Windows .NET Framework C# compiler was not found.'
}
if (-not (Test-Path $source)) {
    throw "Launcher source not found: $source"
}

& $compiler /nologo /target:winexe /platform:anycpu /optimize+ "/out:$executable" /reference:System.dll /reference:System.Core.dll /reference:System.Windows.Forms.dll $source
if ($LASTEXITCODE -ne 0) {
    throw "Launcher compilation failed with exit code $LASTEXITCODE."
}

if ($env:FIELDNOTES_SKIP_SHORTCUT -ne '1') {
    $desktop = [Environment]::GetFolderPath('Desktop')
    if (-not [string]::IsNullOrWhiteSpace($desktop)) {
        $shortcutPath = Join-Path $desktop 'Fieldnotes - C++ Learning Studio.lnk'
        $shell = New-Object -ComObject WScript.Shell
        $shortcut = $shell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = $executable
        $shortcut.WorkingDirectory = $root
        $shortcut.Description = 'Open the folder-backed Fieldnotes C++ learning app'
        $shortcut.IconLocation = "$executable,0"
        $shortcut.Save()
        Write-Output "Desktop shortcut: $shortcutPath"
    }
}

Write-Output "Built: $executable"
