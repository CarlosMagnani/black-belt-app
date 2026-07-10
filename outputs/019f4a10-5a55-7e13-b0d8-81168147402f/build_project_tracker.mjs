import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const referencePath = "C:/Users/carlo/.codex/plugins/cache/openai-curated-remote/openai-templates/0.1.0/skills/artifact-template-project-tracker/assets/reference.xlsx";
const outputDir = "C:/Projects/black-belt-app/outputs/019f4a10-5a55-7e13-b0d8-81168147402f";
const outputPath = `${outputDir}/BlackBelt_Project_Tracker_v0.1.0.xlsx`;

const tasks = [
  ["Foundation", "Frontend scaffold", "", "Complete", "P0", "", ""],
  ["Foundation", "Backend scaffold", "", "Complete", "P0", "", ""],
  ["Foundation", "Connect Supabase project", "", "Not Started", "P0", "", ""],
  ["Foundation", "Provision Railway PostgreSQL", "", "Not Started", "P0", "", ""],
  ["Foundation", "Run initial Prisma migration", "", "Not Started", "P0", "", ""],
  ["Foundation", "Implement Supabase JWT validation", "", "Not Started", "P0", "", ""],
  ["Authentication", "Registration and login", "", "Not Started", "P0", "", ""],
  ["Authentication", "Session persistence", "", "Not Started", "P0", "", ""],
  ["Authentication", "Logout and password reset", "", "Not Started", "P0", "", ""],
  ["Onboarding", "Role selection splash", "", "Not Started", "P0", "", ""],
  ["Onboarding", "Owner onboarding", "", "Not Started", "P0", "", ""],
  ["Onboarding", "Student invite onboarding", "", "Not Started", "P0", "", ""],
  ["Onboarding", "Role-based completion redirect", "", "Not Started", "P0", "", ""],
  ["Academy", "Create academy and unique invite code", "", "Not Started", "P0", "", ""],
  ["Academy", "Display and share invite code", "", "Not Started", "P0", "", ""],
  ["Academy", "Student roster", "", "Not Started", "P0", "", ""],
  ["Academy", "Professor role management", "", "Not Started", "P0", "", ""],
  ["Schedule", "Create recurring class", "", "Not Started", "P0", "", ""],
  ["Schedule", "Edit or deactivate class", "", "Not Started", "P0", "", ""],
  ["Schedule", "Weekly schedule view", "", "Not Started", "P0", "", ""],
  ["Check-in", "Student requests check-in", "", "Not Started", "P0", "", ""],
  ["Check-in", "Pending review list", "", "Not Started", "P0", "", ""],
  ["Check-in", "Approve or reject with self-approval guard", "", "Not Started", "P0", "", ""],
  ["Check-in", "Count approved check-in toward progress", "", "Not Started", "P0", "", ""],
  ["Belt", "Student progress view (X/24)", "", "Not Started", "P0", "", ""],
  ["Belt", "Authorized manual promotion", "", "Not Started", "P0", "", ""],
  ["Belt", "Belt change history and audit trail", "", "Not Started", "P0", "", ""],
  ["Dashboards", "Student dashboard", "", "Not Started", "P0", "", ""],
  ["Dashboards", "Owner dashboard", "", "Not Started", "P0", "", ""],
  ["Membership", "Plan creation, assignment, and status", "", "Not Started", "P0", "", ""],
];
const normalizedTasks = tasks.map((row) => row.map((value) => value === "" ? null : value));

const ganttColumns = [
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD",
];

const input = await FileBlob.load(referencePath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("Project Plan");

sheet.getRange("B2:R2").clear({ applyTo: "contents" });
sheet.getRange("C5:E6").clear({ applyTo: "contents" });
sheet.getRange("H5:I6").clear({ applyTo: "contents" });
sheet.getRange("B10:H39").clear({ applyTo: "contents" });
sheet.getRange("B41:AD42").clear({ applyTo: "contents" });
sheet.getRange("B2").values = [["BlackBelt Project Tracker and Weekly Gantt Plan"]];
sheet.getRange("C5").values = [["BlackBelt MVP v0.1.0"]];
sheet.getRange("C6").values = [["BlackBelt"]];
sheet.getRange("H6").values = [[new Date("2026-07-10T00:00:00Z")]];
sheet.getRange("B10:H39").values = normalizedTasks;
sheet.getRange("I10:I39").formulas = Array.from({ length: 30 }, (_, index) => {
  const row = index + 10;
  return [`=IF(OR(G${row}="",H${row}="",H${row}<G${row}),"",H${row}-G${row}+1)`];
});
sheet.getRange("K9:AD9").formulas = [ganttColumns.map((column, index) =>
  index === 0 ? "=$H$6" : `=${ganttColumns[index - 1]}9+7`
)];
sheet.getRange("K10:AD39").formulas = Array.from({ length: 30 }, (_, rowIndex) => {
  const row = rowIndex + 10;
  return ganttColumns.map((column) =>
    `=IF(OR($G${row}="",$H${row}="",$H${row}<$G${row}),"",IF(AND(${column}$9<=$H${row},${column}$9+6>=$G${row}),1,""))`
  );
});
sheet.getRange("B41").values = [[
  "Source: current-handoff.md and 06-current-roadmap.md. P0 reflects required v0.1 scope. Owners and task dates remain blank where undocumented; Timeline Start is the tracker creation date and only anchors the 20-week view. Edit task dates to activate Gantt bars."
]];

const keyCheck = await workbook.inspect({
  kind: "table",
  range: "'Project Plan'!B4:AD39",
  include: "values,formulas",
  tableMaxRows: 39,
  tableMaxCols: 30,
  tableMaxCellChars: 100,
  maxChars: 16000,
});
console.log(keyCheck.ndjson);

const errorCheck = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 4000,
});
console.log(errorCheck.ndjson);

const preview = await workbook.render({
  sheetName: "Project Plan",
  range: "A1:AD42",
  scale: 1.5,
  format: "png",
});
await fs.writeFile(`${outputDir}/final-render.png`, new Uint8Array(await preview.arrayBuffer()));

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
const exportedInput = await FileBlob.load(outputPath);
const verifiedWorkbook = await SpreadsheetFile.importXlsx(exportedInput);
const exportedCheck = await verifiedWorkbook.inspect({
  kind: "table",
  range: "'Project Plan'!B4:I39",
  include: "values,formulas",
  tableMaxRows: 39,
  tableMaxCols: 8,
  tableMaxCellChars: 100,
  maxChars: 10000,
});
console.log(exportedCheck.ndjson);
const exportedErrors = await verifiedWorkbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "exported workbook formula error scan",
  maxChars: 4000,
});
console.log(exportedErrors.ndjson);
const exportedPreview = await verifiedWorkbook.render({
  sheetName: "Project Plan",
  range: "A1:AD42",
  scale: 0.75,
  format: "png",
});
await fs.writeFile(`${outputDir}/exported-render.png`, new Uint8Array(await exportedPreview.arrayBuffer()));
console.log(JSON.stringify({ outputPath }));
