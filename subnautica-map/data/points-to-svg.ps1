
$startTag = '<svg xmlns="http://www.w3.org/2000/svg" width="4096" height="4096">'
$endTag = '</svg>'

# $points = ConvertFrom-Json -InputObject (Get-Content -Path lost_river_fixed.json -Raw)
# $points = ConvertFrom-Json -InputObject (Get-Content -Path jellyshroomcave-fixed.json -Raw)
$points = ConvertFrom-Json -InputObject (Get-Content -Path deepGrandReef-fixed.json -Raw)

$sortedByBiome = $points | Sort-Object -Property Biome

$colourMap = @{
    "bloodKelp" = "#DB7093"
    "BloodKelp_Trench" = "#DB7093"
    "bloodKelpTwo" = "#DB7093"
    "deepGrandReef" = "#4169E1"
    "grandReef" = "#b3d4fc"
    "grandReef2" = "#b3d4fc"
    "kelpForest" = "#FFA500"
    "kooshZone" = "#663399"
    "LostRiver_BonesField" = "#718c22"
    "LostRiver_BonesField_Corridor" = "#718c22"
    "LostRiver_Canyon" = "#578c22"
    "LostRiver_Corridor" = "#228c57"
    "LostRiver_GhostTree" = "#8c8c22"
    "LostRiver_GhostTree_Lower" = "#8c8c22"
    "LostRiver_GhostTree_Skeleton" = "#8c8c22"
    "LostRiver_Junction" = "#228b22"
    "LostRiver_TreeCove" = "#228c8c"
    "mountains" = "#696969"
    "mushroomForest" = "#FFDAB9"
    "PrecursorGun" = "#2F4F4F"
    "safeShallows" = "	#FFEFD5"
    "seaTreaderPath" = "#CD853F"
    "underwaterIslands" = "#E9967A"
    "JellyshroomCaves" = "#EE82EE"
}

function BiomePolygons() {
    $pointsList = ""
    $curBiome = ""
    $biomePoints = @{}
    Write-Output $startTag;
    foreach ($point in $points) {
        $curBiome = $point.Biome

        if (-not $biomePoints.ContainsKey($curBiome)) {
            $biomePoints[$curBiome] = ""
        }

        $x = $point.X + 2048
        $y = ($point.Y - 2048) * -1;
        $biomePoints[$curBiome] = $biomePoints[$curBiome] + "$x,$y "
    }

    foreach ($key in $biomePoints.Keys) {
        Write-Output ("<polygon points='{0}' style='fill:{1};stoke:black;stroke-width:2'><title>{2}</title></polygon> " -f $biomePoints[$key],$colourMap[$key], $key)    }

   Write-Output $endTag;        
}

function BiomePolygonsFirstAttemp() {
    $pointsList = ""
    $curBiome = ""
    Write-Output $startTag;
    foreach ($point in $sortedByBiome) {
        if ($curBiome -eq "") {
            $curBiome = $point.Biome
        }
        
        if ($point.Biome -eq $curBiome ) {
            $x = $point.X + 2048;
            $y = $point.y + 2048;
            $pointsList += "$x,$y "
        } else {
            Write-Output ("<polygon points='{0}' style='fill:{1};stoke:black;stroke-width:2'/> " -f $pointsList,$colourMap[$curBiome])
            $curBiome = $point.Biome
            $x = $point.X + 2048;
            $y = $point.y + 2048;
            $pointsList = "$x,$y "
        }
   }
   Write-Output $endTag;        
}

function Simple() {
    $pointsList = ""
    foreach ($point in $points) {
        $x = $point.X + 2048;
        $y = $point.y + 2048;
        $pointsList += "$x,$y "
    }
    
    Write-Output $startTag;
    Write-Output "<polyline fill='none' stroke='black' points='$pointsList' />"
    Write-Output $endTag;        
}

BiomePolygons
