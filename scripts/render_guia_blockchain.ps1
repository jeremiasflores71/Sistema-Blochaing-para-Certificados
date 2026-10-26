$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$inputFile = Join-Path $taskRoot 'output\documentos\Guia_explicativa_sistema_y_Blockchain_UMSA.docx'
$qaFolder = Join-Path $taskRoot 'tmp\guia_blockchain_qa'
New-Item -ItemType Directory -Force -Path $qaFolder | Out-Null
$pdfFile = Join-Path $qaFolder 'revision.pdf'
$wordApp = $null
$wordDocument = $null
try {
    $wordApp = New-Object -ComObject Word.Application
    $wordApp.Visible = $false
    $wordApp.DisplayAlerts = 0
    $wordApp.AutomationSecurity = 3
    $wordDocument = $wordApp.Documents.Open($inputFile, $false, $false)
    $wordDocument.Fields.Update() | Out-Null
    $wordDocument.Repaginate()
    Write-Output "Paginas: $($wordDocument.ComputeStatistics(2))"
    $wordDocument.Save()
    $wordDocument.ExportAsFixedFormat($pdfFile, 17)
    Write-Output $pdfFile
} finally {
    if ($null -ne $wordDocument) { $wordDocument.Close(0) }
    if ($null -ne $wordApp) { $wordApp.Quit() }
}
