export function buildKitchenSlipText({ tableNumber, partyName, partySize, server, allergies, notes, time }) {
  const lineDivider = "========================================";
  const subDivider  = "----------------------------------------";
  
  const allergyLines = allergies && allergies.length > 0 
    ? allergies.map(a => `! ALLERGY ALERT: ${a.toUpperCase()}`).join("\n")
    : "NO RECORDED ALLERGIES";

  return `${lineDivider}
MAÎTRE-OS :: KITCHEN EXPEDITER SLIP
REST. NORDIC COPENHAGEN
${lineDivider}
TABLE:       #${tableNumber}
GUEST:       ${partyName.toUpperCase()}
COVERS:      ${partySize} GUESTS
SERVICE:     ${server || "FLOOR EXPEDITER"}
TIMESTAMP:   ${time || "20:25:00"}
${subDivider}
DIETARY / ALLERGEN AUDIT:
${allergyLines}
${subDivider}
SPECIAL INSTRUCTIONS:
${notes || "STANDARD SERVICE FLOW"}
${lineDivider}
PRIORITY SEATING RE-ASSIGNMENT CONFIRMED
HEAD CHEF PASS ACKNOWLEDGEMENT REQUIRED
${lineDivider}`;
}
