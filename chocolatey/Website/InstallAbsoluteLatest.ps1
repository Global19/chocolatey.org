# ==============================================================================
# 
# Fervent Coder Copyright 2011 - Present - Released under the Apache 2.0 License
# 
# Copyright 2007-2008 The Apache Software Foundation.
#  
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use 
# this file except in compliance with the License. You may obtain a copy of the 
# License at 
#
#     http://www.apache.org/licenses/LICENSE-2.0 
# 
# Unless required by applicable law or agreed to in writing, software distributed 
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
# CONDITIONS OF ANY KIND, either express or implied. See the License for the 
# specific language governing permissions and limitations under the License.
# ==============================================================================

# variables
$url = "https://chocolatey.org/api/v2/package/chocolatey/"
if ($env:TEMP -eq $null) {
  $env:TEMP = Join-Path $env:SystemDrive 'temp'
}
$chocTempDir = Join-Path $env:TEMP "chocolatey"
$tempDir = Join-Path $chocTempDir "chocInstall"
if (![System.IO.Directory]::Exists($tempDir)) {[System.IO.Directory]::CreateDirectory($tempDir)}
$file = Join-Path $tempDir "chocolatey.zip"

function Download-File {
param (
  [string]$url,
  [string]$file
 )
  Write-Host "Downloading $url to $file"
  $downloader = new-object System.Net.WebClient
  $downloader.DownloadFile($url, $file)
}

$absoluteLatestVersionUrl = "https://chocolatey.org/api/v2/Packages()?`$filter=(Id%20eq%20'chocolatey')%20and%20IsAbsoluteLatestVersion"
$absXml = (new-object net.webclient).DownloadString("$absoluteLatestVersionUrl")
$regex = '\<content type\=\"application\/zip\" src=\"(?<Url>.*)\"'
$matchingItems = ([regex]$regex).match($absXml)
if ($matchingItems.Success) {
  $groupMatch = $matchingItems.Groups['Url']
  if ($groupMatch.Success) {
    $url = $groupMatch.Value
  }
}

# download the package
Download-File $url $file

#download 7zip
Write-Host "Download 7Zip commandline tool"
$7zaExe = Join-Path $tempDir '7za.exe'
Download-File 'https://chocolatey.org/7za.exe' "$7zaExe"
# Github's Raw endpoint does not honor TLS and the .net 2.0 client will
# not fall back to Ssl3 un like the newer .net4 clients. So .net2 will 
# time out if we do not explicitly set the protocol to Ssl3
#$currentProtocol = [System.Net.ServicePointManager]::SecurityProtocol
#try {
#    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Ssl3
#    Download-File 'https://github.com/chocolatey/chocolatey/blob/master/src/tools/7za.exe?raw=true' "$7zaExe"
#}
#catch {
#    throw
#}
#finally {
#    [System.Net.ServicePointManager]::SecurityProtocol = $currentProtocol
#}

# unzip the package
Write-Host "Extracting $file to $tempDir..."
Start-Process "$7zaExe" -ArgumentList "x -o`"$tempDir`" -y `"$file`"" -Wait -NoNewWindow
#$shellApplication = new-object -com shell.application 
#$zipPackage = $shellApplication.NameSpace($file) 
#$destinationFolder = $shellApplication.NameSpace($tempDir) 
#$destinationFolder.CopyHere($zipPackage.Items(),0x10)

# call chocolatey install
Write-Host "Installing chocolatey on this machine"
$toolsFolder = Join-Path $tempDir "tools"
$chocInstallPS1 = Join-Path $toolsFolder "chocolateyInstall.ps1"

& $chocInstallPS1

write-host 'Ensuring chocolatey commands are on the path'
$chocInstallVariableName = "ChocolateyInstall"
$chocoPath = [Environment]::GetEnvironmentVariable($chocInstallVariableName, [System.EnvironmentVariableTarget]::User)
$chocoExePath = 'C:\ProgramData\Chocolatey\bin'
if ($chocoPath -ne $null) {
  $chocoExePath = Join-Path $chocoPath 'bin'
}

if ($($env:Path).ToLower().Contains($($chocoExePath).ToLower()) -eq $false) {
  $env:Path = [Environment]::GetEnvironmentVariable('Path',[System.EnvironmentVariableTarget]::Machine);
}

Write-Host 'Ensuring chocolatey.nupkg is in the lib folder'
$chocoPkgDir = Join-Path $chocoPath 'lib\chocolatey'
$nupkg = Join-Path $chocoPkgDir 'chocolatey.nupkg'
if (![System.IO.Directory]::Exists($chocoPkgDir)) { [System.IO.Directory]::CreateDirectory($chocoPkgDir); }
Copy-Item "$file" "$nupkg" -Force -ErrorAction SilentlyContinue
