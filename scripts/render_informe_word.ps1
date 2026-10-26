$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$inputFile = Join-Path $taskRoot 'output\documentos\Informe_integral_certificacion_academica_Blockchain_UMSA.docx'
$pdfFile = Join-Path $taskRoot 'tmp\informe_qa\informe_revision.pdf'
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
    $pageCount = $wordDocument.ComputeStatistics(2)
    $wordDocument.Save()
    $wordDocument.ExportAsFixedFormat($pdfFile, 17)
    Write-Output "Paginas: $pageCount"
    Write-Output "PDF de revision: $pdfFile"
} finally {
    if ($null -ne $wordDocument) { $wordDocument.Close(0) }
    if ($null -ne $wordApp) { $wordApp.Quit() }
}
